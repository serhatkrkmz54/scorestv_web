"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { searchAll } from "@/lib/search-client";
import {
  EMPTY_SEARCH,
  searchHitCount,
  type SearchCoachHit,
  type SearchCountryHit,
  type SearchFixtureHit,
  type SearchLeagueHit,
  type SearchPlayerHit,
  type SearchResponse,
  type SearchTeamHit,
} from "@/lib/search-types";
import {
  countryPath,
  leaguePath,
  matchPath,
  playerPath,
  teamPath,
} from "@/lib/routes";
import { TeamLogo } from "./TeamLogo";
import { IconSearch } from "@/components/icons";

/** Debounce — kullanici yazarken 180ms bekle, sonra ara. */
const DEBOUNCE_MS = 180;

/**
 * Backend "derin arama" min sorgu uzunlugu (DeepSearchService.MIN_LEN ile ayni
 * tutulmali). Sonuc bos + sorgu >= bu uzunluk ise backend, API-Football'un
 * ?search= uclarindan kaydi cekip ES'e yaziyor olabilir.
 */
const DEEP_MIN_LEN = 3;

/**
 * Sonuc bos kalinca SESSIZ yeniden-deneme gecikmeleri (ms). Backend derin
 * aramayi tetikledi; cekilen takim/oyuncu/lig/ulke kisa sure sonra ES'e
 * indekslenir. Kullanici tekrar yazmadan, bu retry'ler sonuc gelir gelmez
 * dropdown'u doldurur. Sonuc bulununca kalan denemeler iptal edilir.
 */
const RETRY_DELAYS_MS = [2500, 5000];

/** Flat item — keyboard navigation icin tum gruplari tek listeye indirgemis hali. */
type FlatItem =
  | { kind: "team"; href: string; hit: SearchTeamHit }
  | { kind: "league"; href: string; hit: SearchLeagueHit }
  | { kind: "player"; href: string; hit: SearchPlayerHit }
  | { kind: "fixture"; href: string; hit: SearchFixtureHit }
  | { kind: "country"; href: string; hit: SearchCountryHit }
  | { kind: "coach"; href: string; hit: SearchCoachHit };

/**
 * Koç sonucu icin href — koç detay sayfasi yok; mevcut takim biliniyorsa
 * takim sayfasina yonlendiririz, bilinmiyorsa "#" (tiklama no-op, satir yine
 * de bilgi gosterir).
 */
function coachHref(lang: "tr" | "en", hit: SearchCoachHit): string {
  return hit.currentTeamId != null ? teamPath(lang, hit.currentTeamId) : "#";
}

export function SearchBox() {
  const { lang } = useLang();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchResponse>(EMPTY_SEARCH);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  // Mobilde arama ikona doner; tiklayinca ortada overlay acilir.
  const [mobileOpen, setMobileOpen] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sessiz-retry zamanlayicilari + her sorgu icin artan run-id (eski retry'leri
  // gecersiz kilmak icin). Sorgu degisince / temizlenince hepsi iptal edilir.
  const retryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef(0);

  const clearRetries = useCallback(() => {
    for (const t of retryTimersRef.current) clearTimeout(t);
    retryTimersRef.current = [];
  }, []);

  const t = useCallback(
    (tr: string, en: string) => (lang === "tr" ? tr : en),
    [lang],
  );

  // Tum sonuclari (gosterim sirasiyla) tek listeye indirge — klavye navigasyonu icin.
  const flat = useMemo<FlatItem[]>(() => {
    const out: FlatItem[] = [];
    for (const h of data.teams) out.push({ kind: "team", href: teamPath(lang, h.slug || h.id), hit: h });
    for (const h of data.leagues) out.push({ kind: "league", href: leaguePath(lang, h.slug || h.id), hit: h });
    for (const h of data.players) out.push({ kind: "player", href: playerPath(lang, h.slug || h.id), hit: h });
    for (const h of data.fixtures) out.push({ kind: "fixture", href: matchPath(lang, h.slug), hit: h });
    for (const h of data.countries) out.push({ kind: "country", href: countryPath(lang, h.slug || h.id), hit: h });
    for (const h of data.coaches ?? []) out.push({ kind: "coach", href: coachHref(lang, h), hit: h });
    return out;
  }, [data, lang]);

  const totalHits = searchHitCount(data);

  // Sonuc bos kaldiginda backend derin-aramayi tetikler; bu fonksiyon kisa
  // araliklarla sessizce yeniden sorgular. Yeni indekslenen sonuc gelir gelmez
  // dropdown'u doldurur ve kalan denemeleri iptal eder. runId, sorgu degisince
  // (eski) retry'lerin sonucu yazmasini engeller.
  const scheduleSilentRetries = useCallback(
    (q: string, runId: number) => {
      clearRetries();
      for (const delay of RETRY_DELAYS_MS) {
        const tid = setTimeout(async () => {
          if (runIdRef.current !== runId) return; // sorgu degisti
          try {
            const r = await searchAll(q, lang);
            if (runIdRef.current !== runId) return;
            if (searchHitCount(r) > 0) {
              setData(r);
              setActiveIdx(0);
              clearRetries(); // sonuc geldi → kalan denemeler gereksiz
            }
          } catch {
            // sessiz
          }
        }, delay);
        retryTimersRef.current.push(tid);
      }
    },
    [lang, clearRetries],
  );

  // Debounced fetch — query degisince yeni timer; eskiyi iptal et + AbortController ile pending fetch'i kes.
  // Query bos ise effect erken cikar; data temizleme zaten onChange'de yapilir (R19 set-state-in-effect kuralina uymak icin).
  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    clearRetries();
    const myRun = ++runIdRef.current;
    debounceRef.current = setTimeout(async () => {
      // Bir oncekini iptal et
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const r = await searchAll(q, lang, ctrl.signal);
        // Bu cevap halen guncel mi? (race koruma — ctrl.signal.aborted check)
        if (ctrl.signal.aborted || runIdRef.current !== myRun) return;
        setData(r);
        const hits = searchHitCount(r);
        setActiveIdx(hits > 0 ? 0 : -1);
        // Hic sonuc yok + sorgu yeterince uzunsa: backend derin-arama tetiklemis
        // olabilir → sessizce yeniden dene ki yeni kayitlar otomatik gorunsun.
        if (hits === 0 && q.length >= DEEP_MIN_LEN) {
          scheduleSilentRetries(q, myRun);
        }
      } catch {
        // Abort — sessiz
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearRetries();
    };
  }, [query, lang, clearRetries, scheduleSilentRetries]);

  // Dis tik / Escape — dropdown kapat
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Global "/" kisayolu — INPUT/TEXTAREA disinda iken focus ver.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeAndNavigate = useCallback(
    (href: string) => {
      // Koç (takimsiz) gibi yonlendirilemeyen satirlar — no-op.
      if (!href || href === "#") return;
      setOpen(false);
      setQuery("");
      setData(EMPTY_SEARCH);
      setActiveIdx(-1);
      runIdRef.current++; // bekleyen sessiz-retry'leri gecersiz kil
      clearRetries();
      router.push(href);
    },
    [router, clearRetries],
  );

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setMobileOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || flat.length === 0) {
      if (e.key === "ArrowDown" && totalHits === 0) setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? flat.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[activeIdx >= 0 ? activeIdx : 0];
      if (item) closeAndNavigate(item.href);
    }
  };

  // Overlay acilinca input'a odaklan.
  useEffect(() => {
    if (mobileOpen) inputRef.current?.focus();
  }, [mobileOpen]);

  const showDropdown = open && query.trim().length > 0;

  return (
    <>
      <button
        type="button"
        className="search-trigger"
        onClick={() => setMobileOpen(true)}
        aria-label={t("Ara", "Search")}
      >
        <IconSearch s={20} />
      </button>
      {mobileOpen ? (
        <div className="search-backdrop" onClick={() => setMobileOpen(false)} aria-hidden />
      ) : null}
      <div className={"search" + (mobileOpen ? " mobile-open" : "")} ref={wrapRef}>
        <span className="s-ico">
          <IconSearch s={18} />
        </span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setOpen(true);
          if (!v.trim()) {
            setData(EMPTY_SEARCH);
            setLoading(false);
            setActiveIdx(-1);
            if (abortRef.current) abortRef.current.abort();
            runIdRef.current++; // bekleyen sessiz-retry'leri gecersiz kil
            clearRetries();
          }
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onInputKeyDown}
        placeholder={t("Takım, lig, oyuncu, maç ara...", "Search team, league, player, match...")}
        aria-label={t("Ara", "Search")}
        aria-autocomplete="list"
        aria-controls="search-dropdown-list"
        autoComplete="off"
        spellCheck={false}
      />
      <kbd>/</kbd>

      {showDropdown ? (
        <div className="search-dropdown" role="listbox" id="search-dropdown-list">
          {loading && totalHits === 0 ? (
            <div className="sd-empty">{t("Aranıyor...", "Searching...")}</div>
          ) : totalHits === 0 ? (
            <div className="sd-empty">{t("Sonuç bulunamadı.", "No results.")}</div>
          ) : (
            <>
              <ResultGroup
                title={t("Takımlar", "Teams")}
                items={data.teams}
                renderItem={(h, idx) => (
                  <ResultRow
                    key={`t-${h.id}`}
                    href={teamPath(lang, h.slug || h.id)}
                    active={flat[activeIdx]?.kind === "team" && flat[activeIdx]?.hit.id === h.id}
                    onSelect={closeAndNavigate}
                    thumb={<TeamLogo name={preferred(h.name, h.nameTr, lang)} logo={h.logoUrl} size={28} />}
                    title={preferred(h.name, h.nameTr, lang)}
                    subtitle={preferred(h.country ?? "", h.countryTr ?? "", lang) || null}
                    badge={t("Takım", "Team")}
                    flatIdx={idx}
                  />
                )}
                offset={0}
              />
              <ResultGroup
                title={t("Ligler", "Leagues")}
                items={data.leagues}
                renderItem={(h, idx) => (
                  <ResultRow
                    key={`l-${h.id}`}
                    href={leaguePath(lang, h.slug || h.id)}
                    active={flat[activeIdx]?.kind === "league" && flat[activeIdx]?.hit.id === h.id}
                    onSelect={closeAndNavigate}
                    thumb={
                      h.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.logoUrl} alt="" width={28} height={28} className="sd-thumb-img" loading="lazy" />
                      ) : (
                        <span className="sd-thumb-fallback">L</span>
                      )
                    }
                    title={preferred(h.name, h.nameTr, lang)}
                    subtitle={preferred(h.country ?? "", h.countryTr ?? "", lang) || null}
                    badge={h.type ? h.type : t("Lig", "League")}
                    flatIdx={idx}
                  />
                )}
                offset={data.teams.length}
              />
              <ResultGroup
                title={t("Oyuncular", "Players")}
                items={data.players}
                renderItem={(h, idx) => (
                  <ResultRow
                    key={`p-${h.id}`}
                    href={playerPath(lang, h.slug || h.id)}
                    active={flat[activeIdx]?.kind === "player" && flat[activeIdx]?.hit.id === h.id}
                    onSelect={closeAndNavigate}
                    thumb={
                      h.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.photoUrl} alt="" width={28} height={28} className="sd-thumb-img is-round" loading="lazy" />
                      ) : (
                        <span className="sd-thumb-fallback is-round">{(h.name?.[0] ?? "?").toUpperCase()}</span>
                      )
                    }
                    title={h.name}
                    subtitle={
                      [h.nationality ?? "", h.age != null ? `${h.age}` : ""]
                        .filter(Boolean)
                        .join(" - ") || null
                    }
                    badge={t("Oyuncu", "Player")}
                    flatIdx={idx}
                  />
                )}
                offset={data.teams.length + data.leagues.length}
              />
              <ResultGroup
                title={t("Maçlar", "Matches")}
                items={data.fixtures}
                renderItem={(h, idx) => (
                  <ResultRow
                    key={`f-${h.id}`}
                    href={matchPath(lang, h.slug)}
                    active={flat[activeIdx]?.kind === "fixture" && flat[activeIdx]?.hit.id === h.id}
                    onSelect={closeAndNavigate}
                    thumb={<span className="sd-thumb-fallback">{(h.statusShort ?? "?").slice(0, 2).toUpperCase()}</span>}
                    title={preferred(h.matchup, h.matchupTr, lang)}
                    subtitle={
                      [
                        preferred(h.leagueName ?? "", h.leagueNameTr ?? "", lang),
                        formatKickoff(h.kickoff, lang),
                      ]
                        .filter(Boolean)
                        .join(" - ") || null
                    }
                    badge={t("Maç", "Match")}
                    flatIdx={idx}
                  />
                )}
                offset={data.teams.length + data.leagues.length + data.players.length}
              />
              <ResultGroup
                title={t("Ülkeler", "Countries")}
                items={data.countries}
                renderItem={(h, idx) => (
                  <ResultRow
                    key={`c-${h.id}`}
                    href={countryPath(lang, h.slug || h.id)}
                    active={flat[activeIdx]?.kind === "country" && flat[activeIdx]?.hit.id === h.id}
                    onSelect={closeAndNavigate}
                    thumb={
                      h.flagUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.flagUrl} alt="" width={28} height={28} className="sd-thumb-img" loading="lazy" />
                      ) : (
                        <span className="sd-thumb-fallback">{(h.code ?? h.name?.[0] ?? "?").slice(0, 2).toUpperCase()}</span>
                      )
                    }
                    title={preferred(h.name, h.nameTr, lang)}
                    subtitle={h.code || null}
                    badge={t("Ülke", "Country")}
                    flatIdx={idx}
                  />
                )}
                offset={
                  data.teams.length + data.leagues.length + data.players.length + data.fixtures.length
                }
              />
              <ResultGroup
                title={t("Teknik Direktörler", "Coaches")}
                items={data.coaches ?? []}
                renderItem={(h, idx) => (
                  <ResultRow
                    key={`co-${h.id}`}
                    href={coachHref(lang, h)}
                    active={flat[activeIdx]?.kind === "coach" && flat[activeIdx]?.hit.id === h.id}
                    onSelect={closeAndNavigate}
                    thumb={
                      h.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.photoUrl} alt="" width={28} height={28} className="sd-thumb-img is-round" loading="lazy" />
                      ) : (
                        <span className="sd-thumb-fallback is-round">{(h.name?.[0] ?? "?").toUpperCase()}</span>
                      )
                    }
                    title={h.name}
                    subtitle={
                      [h.nationality ?? "", h.currentTeamName ?? ""]
                        .filter(Boolean)
                        .join(" - ") || null
                    }
                    badge={t("Teknik Direktör", "Coach")}
                    flatIdx={idx}
                  />
                )}
                offset={
                  data.teams.length + data.leagues.length + data.players.length + data.fixtures.length + data.countries.length
                }
              />
              <div className="sd-foot">
                <span className="sd-foot-hint">
                  {t("Yön tuşları ile gez, Enter ile aç, Esc ile kapat", "Arrow keys to navigate, Enter to open, Esc to close")}
                </span>
                {data.tookMs > 0 ? <span className="sd-foot-took">{data.tookMs}ms</span> : null}
              </div>
            </>
          )}
        </div>
      ) : null}
      </div>
    </>
  );
}

// ============================================================
// Sub-bilesenler
// ============================================================

function ResultGroup<T>({
  title,
  items,
  renderItem,
  offset,
}: {
  title: string;
  items: T[];
  renderItem: (item: T, flatIdx: number) => React.ReactNode;
  offset: number;
}) {
  if (items.length === 0) return null;
  return (
    <section className="sd-group">
      <header className="sd-group-head">{title}</header>
      <ul className="sd-list">
        {items.map((it, i) => (
          <li key={i + offset}>{renderItem(it, i + offset)}</li>
        ))}
      </ul>
    </section>
  );
}

function ResultRow({
  href,
  active,
  thumb,
  title,
  subtitle,
  badge,
  onSelect,
}: {
  href: string;
  active: boolean;
  thumb: React.ReactNode;
  title: string;
  subtitle: string | null;
  badge?: string;
  onSelect: (href: string) => void;
  /** Klavye navigasyonu icin flat index — render'da kullanilmasa da prop tutarliligi icin tasinir. */
  flatIdx?: number;
}) {
  return (
    <Link
      href={href}
      className={"sd-item" + (active ? " is-active" : "")}
      role="option"
      aria-selected={active}
      onClick={(e) => {
        e.preventDefault();
        onSelect(href);
      }}
    >
      <span className="sd-thumb">{thumb}</span>
      <span className="sd-text">
        <span className="sd-title">{title}</span>
        {subtitle ? <span className="sd-sub">{subtitle}</span> : null}
      </span>
      {badge ? <span className="sd-badge">{badge}</span> : null}
    </Link>
  );
}

// ============================================================
// Helpers
// ============================================================

function preferred(en: string, tr: string | null | undefined, lang: "tr" | "en"): string {
  if (lang === "tr" && tr && tr.trim()) return tr;
  return en || tr || "";
}

function formatKickoff(iso: string | null, lang: "tr" | "en"): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
