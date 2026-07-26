"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { Logo } from "@/components/shell/Logo";
import {
  IconBall,
  IconCalendar,
  IconCamera,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconHome,
  IconLogout,
  IconNews,
  IconPoint,
  IconTrophy,
  IconWhistle,
} from "@/components/icons";
import { MatchDesk, type DeskFixture } from "./MatchDesk";

/**
 * Saha Muhabiri konsolu — /muhabir.
 *
 * Akış: başvuru → (admin onayı) → atanmış lig → takım + fikstür girişi →
 * maç günü canlı konsol (başlat/gol/devre/bitir). Girilen her şey
 * source=manual; API verisine dokunulmaz. Biten her maç Scores Puanı kazandırır.
 */

interface AssignedLeague {
  leagueId: number;
  leagueName: string;
  logo: string | null;
  teamCount: number;
  fixtureCount: number;
}
interface Application {
  id: number;
  leagueName: string;
  region: string | null;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  leagueId: number | null;
  createdAt: string;
}
interface MeResponse {
  leagues: AssignedLeague[];
  applications: Application[];
}
interface TeamView {
  id: number;
  name: string;
  logo: string | null;
}

/** Gizli file input'lu logo yükleme düğmesi (PNG/JPG/WebP, max 2MB). */
function LogoUpload({
  url,
  title,
  onDone,
  onError,
}: {
  url: string;
  title: string;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  return (
    <label className="mrc-logo-btn" title={title}>
      <IconCamera s={14} />
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > 2 * 1024 * 1024) {
            onError("Logo en fazla 2MB olabilir.");
            return;
          }
          const form = new FormData();
          form.append("file", file);
          try {
            const r = await fetch(url, { method: "POST", body: form });
            if (!r.ok) {
              const body = (await r.json()) as { message?: string };
              onError(body.message ?? "Yükleme başarısız.");
              return;
            }
            onDone();
          } catch {
            onError("Yükleme başarısız.");
          }
        }}
      />
    </label>
  );
}
type FixtureView = DeskFixture;

const LIVE = new Set(["1H", "HT", "2H"]);

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await r.json()) as T & { message?: string };
  if (!r.ok) throw new Error(data.message ?? "İşlem başarısız.");
  return data;
}

function fmtKickoff(iso: string, lang: "tr" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

// ==================== Fikstür satırı (kompakt) ====================

function FixtureRow({
  f,
  lang,
  active,
  onManage,
}: {
  f: FixtureView;
  lang: "tr" | "en";
  active: boolean;
  onManage: () => void;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const live = LIVE.has(f.statusShort);
  const done = f.statusShort === "FT";
  return (
    <div className={`mrc-fixture ${active ? "is-active" : ""}`}>
      <div className="mrc-fix-head">
        <span className="mrc-fix-teams">
          {f.homeTeamName} <b className="tnum">{f.homeGoals ?? "-"}</b>
          <i>:</i>
          <b className="tnum">{f.awayGoals ?? "-"}</b> {f.awayTeamName}
        </span>
        <span className={`mrc-fix-status ${live ? "is-live" : ""}`}>
          {live && <span className="live-dot pulse" />}
          {f.statusShort}
          {live && f.elapsed != null
            ? ` · ${f.elapsed}${f.statusExtra ? `+${f.statusExtra}` : ""}'`
            : ""}
        </span>
      </div>
      <div className="mrc-fix-meta">
        {fmtKickoff(f.kickoffAt, lang)}
        {f.round ? ` · ${f.round}` : ""}
        {done && <span className="mrc-done"><IconCheck s={12} /> +100</span>}
        <button className="mrc-act manage" onClick={onManage}>
          {active ? t("Masayı Kapat", "Close Desk") : (
            <>{t("Yönet", "Manage")} <IconChevronRight s={11} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ==================== Lig paneli ====================

function LeaguePanel({
  league,
  lang,
  onLeagueLogoChange,
}: {
  league: AssignedLeague;
  lang: "tr" | "en";
  onLeagueLogoChange?: () => void;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [teams, setTeams] = useState<TeamView[]>([]);
  const [fixtures, setFixtures] = useState<FixtureView[]>([]);
  const [teamName, setTeamName] = useState("");
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");
  const [kickoff, setKickoff] = useState("");
  const [round, setRound] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  /** Açık maç yönetim masası (fixture id). */
  const [deskId, setDeskId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [tr1, fr] = await Promise.all([
        fetch(`/api/reporter/leagues/${league.leagueId}/teams`).then((r) => r.json()),
        fetch(`/api/reporter/leagues/${league.leagueId}/fixtures`).then((r) => r.json()),
      ]);
      if (Array.isArray(tr1)) setTeams(tr1 as TeamView[]);
      if (Array.isArray(fr)) setFixtures(fr as FixtureView[]);
    } catch {
      /* sessiz */
    }
  }, [league.leagueId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async veri cekimi (standart desen)
    void load();
    // Canlı dakika/skor tazeliği: backend job elapsed'i işletir; liste 30 sn'de
    // bir sessizce yenilenir (açık masa da fixture prop'undan güncellenir).
    const id = setInterval(() => void load(), 30000);
    return () => clearInterval(id);
  }, [load]);

  async function addTeam() {
    if (teamName.trim().length < 2) return;
    setBusy(true);
    setMsg(null);
    try {
      await post(`/api/reporter/leagues/${league.leagueId}/teams`, { name: teamName.trim() });
      setTeamName("");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("Eklenemedi.", "Could not add."));
    } finally {
      setBusy(false);
    }
  }

  async function addFixture() {
    if (!homeId || !awayId || !kickoff) {
      setMsg(t("Takımları ve başlama zamanını seçin.", "Pick teams and kickoff time."));
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await post(`/api/reporter/leagues/${league.leagueId}/fixtures`, {
        homeTeamId: Number(homeId),
        awayTeamId: Number(awayId),
        kickoffAt: new Date(kickoff).toISOString(),
        round: round.trim() || null,
      });
      setHomeId("");
      setAwayId("");
      setKickoff("");
      setRound("");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("Oluşturulamadı.", "Could not create."));
    } finally {
      setBusy(false);
    }
  }

  const patchFixture = useCallback((updated: FixtureView) => {
    setFixtures((fs) => fs.map((f) => (f.id === updated.id ? updated : f)));
  }, []);

  return (
    <div className="mrc-league">
      <div className="mrc-league-head">
        {league.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- muhabir logosu
          <img src={league.logo} alt="" className="mrc-logo" />
        ) : (
          <span className="mrc-logo mrc-logo-ph">{league.leagueName.charAt(0)}</span>
        )}
        <h2 className="mrc-league-title">{league.leagueName}</h2>
        <LogoUpload
          url={`/api/reporter/leagues/${league.leagueId}/logo`}
          title={t("Lig logosu yükle", "Upload league logo")}
          onDone={() => {
            setMsg(t("Lig logosu yüklendi.", "League logo uploaded."));
            onLeagueLogoChange?.();
          }}
          onError={setMsg}
        />
      </div>
      {msg && <p className="ri-error">{msg}</p>}

      <div className="mrc-grid">
        {/* Takımlar */}
        <section className="mrc-card">
          <h3 className="mrc-card-title">{t("Takımlar", "Teams")} ({teams.length})</h3>
          <div className="mrc-team-list">
            {teams.map((tm) => (
              <span key={tm.id} className="mrc-team">
                {tm.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- muhabir logosu
                  <img src={tm.logo} alt="" className="mrc-team-logo" />
                ) : null}
                {tm.name}
                <LogoUpload
                  url={`/api/reporter/teams/${tm.id}/logo`}
                  title={t("Takım logosu yükle", "Upload team logo")}
                  onDone={() => void load()}
                  onError={setMsg}
                />
              </span>
            ))}
            {teams.length === 0 && (
              <span className="mrc-empty">{t("Henüz takım yok — ekleyin.", "No teams yet — add some.")}</span>
            )}
          </div>
          <div className="mrc-row">
            <input
              className="ri-input"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={t("Takım adı", "Team name")}
            />
            <button className="ri-submit" disabled={busy} onClick={addTeam}>
              {t("Ekle", "Add")}
            </button>
          </div>
        </section>

        {/* Yeni maç */}
        <section className="mrc-card">
          <h3 className="mrc-card-title">{t("Yeni Maç", "New Match")}</h3>
          <div className="mrc-form">
            <select className="ri-input" value={homeId} onChange={(e) => setHomeId(e.target.value)}>
              <option value="">{t("Ev sahibi", "Home team")}</option>
              {teams.map((tm) => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
            <select className="ri-input" value={awayId} onChange={(e) => setAwayId(e.target.value)}>
              <option value="">{t("Deplasman", "Away team")}</option>
              {teams.map((tm) => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
            <input
              className="ri-input"
              type="datetime-local"
              value={kickoff}
              onChange={(e) => setKickoff(e.target.value)}
            />
            <input
              className="ri-input"
              value={round}
              onChange={(e) => setRound(e.target.value)}
              placeholder={t("Hafta (ops.) — ör. 5. Hafta", "Round (opt.)")}
            />
            <button className="ri-submit" disabled={busy} onClick={addFixture}>
              {t("Maç Oluştur", "Create Match")}
            </button>
          </div>
        </section>
      </div>

      {/* Açık maç yönetim masası */}
      {deskId != null && (() => {
        const f = fixtures.find((x) => x.id === deskId);
        if (!f) return null;
        return (
          <MatchDesk
            fixture={f}
            lang={lang}
            onFixtureUpdate={patchFixture}
            onClose={() => setDeskId(null)}
          />
        );
      })()}

      {/* Fikstür listesi */}
      <section className="mrc-card" style={{ marginTop: 14 }}>
        <h3 className="mrc-card-title">{t("Maçlar", "Matches")} ({fixtures.length})</h3>
        {fixtures.length === 0 && (
          <span className="mrc-empty">{t("Henüz maç yok.", "No matches yet.")}</span>
        )}
        {fixtures.map((f) => (
          <FixtureRow
            key={f.id}
            f={f}
            lang={lang}
            active={deskId === f.id}
            onManage={() => setDeskId(deskId === f.id ? null : f.id)}
          />
        ))}
      </section>
    </div>
  );
}

// ==================== Portal kabuğu (sidebar düzeni) ====================

/** Pexels stok görselleri — yalnızca dekoratif zemin (hotlink serbest). */
const LANDING_BG =
  "https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=1920";
const HERO_BG =
  "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1600";

type PortalView = "overview" | "apps" | `league:${number}`;

function Avatar({ url, name }: { url: string | null; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  return (
    <span className="rp-user-av">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- kullanıcı avatarı
        <img src={url} alt={name} />
      ) : (
        initial
      )}
    </span>
  );
}

/** Sol sabit menü: navigasyon + lig listesi + kullanıcı kartı. */
function Sidebar({
  lang,
  leagues,
  pendingCount,
  view,
  onView,
}: {
  lang: "tr" | "en";
  leagues: AssignedLeague[];
  pendingCount: number;
  view: PortalView;
  onView: (v: PortalView) => void;
}) {
  const { user, logout } = useAuth();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const name = user?.displayName || t("Üye", "Member");
  return (
    <aside className="rp-side">
      <div className="rp-side-brand">
        <Link href="/" className="rp-logo" aria-label="Scores TV">
          <Logo h={24} />
        </Link>
        <span className="rp-side-sub">
          <IconWhistle s={12} /> {t("Saha Muhabiri", "Field Reporter")}
        </span>
      </div>

      <nav className="rp-side-nav">
        <button
          className={`rp-side-item ${view === "overview" ? "is-active" : ""}`}
          onClick={() => onView("overview")}
        >
          <IconHome s={16} /> {t("Genel Bakış", "Overview")}
        </button>
        <button
          className={`rp-side-item ${view === "apps" ? "is-active" : ""}`}
          onClick={() => onView("apps")}
        >
          <IconNews s={16} /> {t("Başvurularım", "Applications")}
          {pendingCount > 0 && <span className="rp-side-badge">{pendingCount}</span>}
        </button>

        <span className="rp-side-label">{t("Liglerim", "My Leagues")}</span>
        {leagues.length === 0 && (
          <span className="rp-side-empty">
            {t("Henüz lig atanmadı.", "No league assigned yet.")}
          </span>
        )}
        {leagues.map((l) => (
          <button
            key={l.leagueId}
            className={`rp-side-item ${view === `league:${l.leagueId}` ? "is-active" : ""}`}
            onClick={() => onView(`league:${l.leagueId}`)}
          >
            {l.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- muhabir logosu
              <img src={l.logo} alt="" className="rp-side-lg" />
            ) : (
              <IconTrophy s={16} />
            )}
            <span className="rp-side-item-nm">{l.leagueName}</span>
            <span className="rp-side-badge dim tnum">{l.fixtureCount}</span>
          </button>
        ))}
      </nav>

      <div className="rp-side-foot">
        {user && (
          <div className="rp-side-user">
            <Avatar url={user.avatarUrl ?? null} name={name} />
            <div className="rp-side-user-txt">
              <b>{name}</b>
              <span>{user.email}</span>
            </div>
          </div>
        )}
        <div className="rp-side-actions">
          <Link href="/">
            <IconChevronLeft s={13} /> {t("Siteye Dön", "Back to Site")}
          </Link>
          {user && (
            <button onClick={() => void logout()}>
              <IconLogout s={13} /> {t("Çıkış", "Sign out")}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

// ==================== Karşılama (giriş yapılmamış) ====================

function Landing({ lang, onSignIn }: { lang: "tr" | "en"; onSignIn: () => void }) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return (
    <div className="rp-land" style={{ backgroundImage: `url(${LANDING_BG})` }}>
      <header className="rp-land-top">
        <Logo h={26} />
        <Link href="/" className="rp-back on-photo">
          <IconChevronLeft s={14} /> {t("Siteye Dön", "Back to Site")}
        </Link>
      </header>
      <div className="rp-land-mid">
        <span className="rp-hero-kicker">
          <IconWhistle s={13} />
          {t("Scores TV Topluluk Programı", "Scores TV Community Program")}
        </span>
        <h1>{t("Saha Muhabiri", "Field Reporter")}</h1>
        <p>
          {t(
            "Bölgendeki amatör ligi ScoresTV'ye sen taşı: fikstürü gir, maç günü canlı skoru tut, her tamamlanan maç için Scores Puanı kazan.",
            "Bring your local amateur league to ScoresTV: enter fixtures, keep live scores on match day, earn Scores Points for every completed match.",
          )}
        </p>
        <div className="rp-steps">
          <div className="rp-step">
            <span className="rp-step-ic"><IconTrophy s={18} /></span>
            <b>{t("1 · Başvur", "1 · Apply")}</b>
            <span>{t(
              "Takip ettiğin ligi anlat, editör onayıyla lig sana atansın.",
              "Tell us about your league; it gets assigned to you on approval.",
            )}</span>
          </div>
          <div className="rp-step">
            <span className="rp-step-ic"><IconBall s={18} /></span>
            <b>{t("2 · Veriyi Gir", "2 · Enter Data")}</b>
            <span>{t(
              "Takımları, fikstürü, kadroları ve maç günü canlı skoru yönet.",
              "Manage teams, fixtures, lineups and live scores on match day.",
            )}</span>
          </div>
          <div className="rp-step">
            <span className="rp-step-ic"><IconPoint s={18} /></span>
            <b>{t("3 · Puan Kazan", "3 · Earn Points")}</b>
            <span>{t(
              "Tamamlanan her maç hesabına +100 Scores Puanı ekler.",
              "Every completed match adds +100 Scores Points to your account.",
            )}</span>
          </div>
        </div>
        <button className="ri-submit rp-cta" onClick={onSignIn}>
          {t("Başlamak için giriş yap", "Sign in to get started")}
        </button>
      </div>
      <footer className="rp-land-foot">
        {t(
          "Bu konsol yalnızca Scores TV saha muhabirleri içindir. Girilen veriler editör ekibince denetlenir.",
          "This console is for Scores TV field reporters only. Submitted data is reviewed by our editors.",
        )}
      </footer>
    </div>
  );
}

// ==================== Ana konsol ====================

export function ReporterConsole() {
  const { user, loading, openAuth } = useAuth();
  const { lang } = useLang();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [view, setView] = useState<PortalView>("overview");
  const [leagueName, setLeagueName] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadMe = useCallback(async () => {
    try {
      const r = await fetch("/api/reporter/me");
      if (r.ok) setMe((await r.json()) as MeResponse);
    } catch {
      /* sessiz */
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async veri cekimi (standart desen)
    if (user) void loadMe();
  }, [user, loadMe]);

  async function apply() {
    if (leagueName.trim().length < 3 || message.trim().length < 20) {
      setMsg(t(
        "Lig adı ve en az 20 karakterlik açıklama gerekli.",
        "League name and a description of at least 20 characters are required.",
      ));
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await post("/api/reporter/applications", {
        leagueName: leagueName.trim(),
        region: region.trim() || null,
        message: message.trim(),
      });
      setLeagueName("");
      setRegion("");
      setMessage("");
      setMsg(t(
        "Başvurun alındı! Editörlerimiz inceleyip onaylayınca ligin burada görünecek.",
        "Application received! Once approved by our editors, your league will appear here.",
      ));
      await loadMe();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("Gönderilemedi.", "Could not send."));
    } finally {
      setBusy(false);
    }
  }

  if (!loading && !user) {
    return <Landing lang={lang} onSignIn={() => openAuth("signin")} />;
  }

  const leagues = me?.leagues ?? [];
  const apps = me?.applications ?? [];
  const pending = apps.filter((a) => a.status === "PENDING").length;
  const totalFixtures = leagues.reduce((s, l) => s + l.fixtureCount, 0);
  const totalTeams = leagues.reduce((s, l) => s + l.teamCount, 0);
  const selected = view.startsWith("league:")
    ? leagues.find((l) => `league:${l.leagueId}` === view) ?? null
    : null;
  const name = user?.displayName || t("Muhabir", "Reporter");

  const statusLabel = (s: Application["status"]) =>
    s === "PENDING"
      ? t("İncelemede", "Under review")
      : s === "APPROVED"
        ? t("Onaylandı", "Approved")
        : t("Reddedildi", "Rejected");

  return (
    <div className="rp-shell">
      <Sidebar
        lang={lang}
        leagues={leagues}
        pendingCount={pending}
        view={view}
        onView={setView}
      />
      <div className="rp-body">
        <main className="rp-main">
          {view === "overview" && (
            <>
              <div className="rp-hero-card" style={{ backgroundImage: `url(${HERO_BG})` }}>
                <span className="rp-hero-kicker">
                  <IconWhistle s={13} /> {t("Saha Muhabiri", "Field Reporter")}
                </span>
                <h1>{t(`Hoş geldin, ${name}`, `Welcome, ${name}`)}</h1>
                <p>
                  {t(
                    "API'lerin görmediği ligleri sen görünür kıl — her tamamlanan maç hesabına +100 Scores Puanı ekler.",
                    "Make the leagues APIs can't see visible — every completed match adds +100 Scores Points.",
                  )}
                </p>
              </div>

              <div className="rp-cards">
                <div className="rp-scard">
                  <span className="rp-scard-ic"><IconTrophy s={17} /></span>
                  <div>
                    <b className="tnum">{leagues.length}</b>
                    <span>{t("Atanmış Lig", "Assigned Leagues")}</span>
                  </div>
                </div>
                <div className="rp-scard">
                  <span className="rp-scard-ic"><IconBall s={17} /></span>
                  <div>
                    <b className="tnum">{totalTeams}</b>
                    <span>{t("Takım", "Teams")}</span>
                  </div>
                </div>
                <div className="rp-scard">
                  <span className="rp-scard-ic"><IconCalendar s={17} /></span>
                  <div>
                    <b className="tnum">{totalFixtures}</b>
                    <span>{t("Maç", "Matches")}</span>
                  </div>
                </div>
                <div className="rp-scard">
                  <span className="rp-scard-ic"><IconNews s={17} /></span>
                  <div>
                    <b className="tnum">{pending}</b>
                    <span>{t("Bekleyen Başvuru", "Pending Applications")}</span>
                  </div>
                </div>
              </div>

              {leagues.length > 0 ? (
                <section>
                  <h2 className="rp-sec-title">{t("Liglerim", "My Leagues")}</h2>
                  <div className="rp-lgrid">
                    {leagues.map((l) => (
                      <button
                        key={l.leagueId}
                        className="rp-lcard"
                        onClick={() => setView(`league:${l.leagueId}`)}
                      >
                        {l.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- muhabir logosu
                          <img src={l.logo} alt="" className="rp-lcard-lg" />
                        ) : (
                          <span className="rp-lcard-ph"><IconTrophy s={20} /></span>
                        )}
                        <b>{l.leagueName}</b>
                        <span>
                          {l.teamCount} {t("takım", "teams")} · {l.fixtureCount} {t("maç", "matches")}
                        </span>
                        <span className="rp-lcard-go">
                          {t("Yönet", "Manage")} <IconChevronRight s={12} />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="rp-onboard">
                  <span className="rp-step-ic"><IconTrophy s={18} /></span>
                  <b>{t("İlk ligini almak için başvur", "Apply to get your first league")}</b>
                  <span>
                    {t(
                      "Takip ettiğin amatör ligi anlat; editör onayıyla lig sana atanır ve hemen veri girmeye başlarsın.",
                      "Tell us about the amateur league you follow; once approved it is assigned to you and you can start entering data.",
                    )}
                  </span>
                  <button className="ri-submit" onClick={() => setView("apps")}>
                    {t("Başvuru Yap", "Apply Now")}
                  </button>
                </div>
              )}

              {apps.length > 0 && (
                <section>
                  <h2 className="rp-sec-title">{t("Son Başvurular", "Recent Applications")}</h2>
                  <div className="mrc-card">
                    <div className="mrc-apps" style={{ marginTop: 0 }}>
                      {apps.slice(0, 3).map((a) => (
                        <div key={a.id} className="mrc-app">
                          <span className="mrc-app-name">{a.leagueName}</span>
                          <span className={`mrc-app-status s-${a.status.toLowerCase()}`}>
                            {statusLabel(a.status)}
                          </span>
                          {a.reviewNote && <span className="mrc-app-note">{a.reviewNote}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {selected && (
            <>
              <button className="rp-crumb" onClick={() => setView("overview")}>
                <IconChevronLeft s={13} /> {t("Genel Bakış", "Overview")}
              </button>
              <LeaguePanel
                league={selected}
                lang={lang}
                onLeagueLogoChange={() => void loadMe()}
              />
            </>
          )}

          {view === "apps" && (
            <>
              <div className="rp-page-head">
                <h1>{t("Başvurularım", "My Applications")}</h1>
                <p>
                  {t(
                    "Hangi ligi girmek istiyorsun? Onaylanınca lig sana atanır ve veri girişine başlarsın.",
                    "Which league do you want to cover? Once approved, the league is assigned to you.",
                  )}
                </p>
              </div>

              {msg && <div className="mrc-msg">{msg}</div>}

              <section className="mrc-card">
                <h3 className="mrc-card-title">{t("Yeni Lig Başvurusu", "Apply for a New League")}</h3>
                <div className="mrc-form">
                  <input
                    className="ri-input"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    maxLength={150}
                    placeholder={t("Lig adı — ör. Ankara 1. Amatör Küme", "League name")}
                  />
                  <input
                    className="ri-input"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    maxLength={150}
                    placeholder={t("Bölge/şehir (ops.)", "Region/city (opt.)")}
                  />
                  <textarea
                    className="ri-input ri-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder={t(
                      "Kendinden bahset: bu ligi nereden takip ediyorsun, hangi sıklıkla girebilirsin?",
                      "Tell us: how do you follow this league, how often can you enter data?",
                    )}
                  />
                  <button className="ri-submit" disabled={busy} onClick={apply}>
                    {busy ? t("Gönderiliyor…", "Sending…") : t("Başvur", "Apply")}
                  </button>
                </div>
              </section>

              {apps.length > 0 && (
                <section className="mrc-card">
                  <h3 className="mrc-card-title">{t("Geçmiş Başvurular", "Past Applications")}</h3>
                  <div className="mrc-apps" style={{ marginTop: 0 }}>
                    {apps.map((a) => (
                      <div key={a.id} className="mrc-app">
                        <span className="mrc-app-name">{a.leagueName}</span>
                        <span className={`mrc-app-status s-${a.status.toLowerCase()}`}>
                          {statusLabel(a.status)}
                        </span>
                        {a.reviewNote && <span className="mrc-app-note">{a.reviewNote}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
        <footer className="rp-foot">
          {t(
            "Bu konsol yalnızca Scores TV saha muhabirleri içindir. Girilen veriler editör ekibince denetlenir.",
            "This console is for Scores TV field reporters only. Submitted data is reviewed by our editors.",
          )}
        </footer>
      </div>
    </div>
  );
}
