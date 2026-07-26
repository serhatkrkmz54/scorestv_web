"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
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
      📷
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
        {done && <span className="mrc-done">✓ +100</span>}
        <button className="mrc-act manage" onClick={onManage}>
          {active ? t("Masayı Kapat", "Close Desk") : t("Yönet →", "Manage →")}
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
            setMsg(t("Lig logosu yüklendi ✓ (sayfa yenilenince görünür)", "League logo uploaded ✓"));
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

// ==================== Ana konsol ====================

export function ReporterConsole() {
  const { user, loading, openAuth } = useAuth();
  const { lang } = useLang();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [activeLeague, setActiveLeague] = useState<number | null>(null);
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
    return (
      <div className="mrc-page">
        <div className="mrc-hero">
          <h1>{t("Saha Muhabiri", "Field Reporter")}</h1>
          <p>
            {t(
              "Bölgendeki amatör ligi ScoresTV'ye sen taşı: fikstürü gir, maç günü canlı skoru tut, her tamamlanan maç için Scores Puanı kazan.",
              "Bring your local amateur league to ScoresTV: enter fixtures, keep live scores on match day, earn Scores Points for every completed match.",
            )}
          </p>
          <button className="ri-submit" onClick={() => openAuth("signin")}>
            {t("Başlamak için giriş yap", "Sign in to get started")}
          </button>
        </div>
      </div>
    );
  }

  const selected = me?.leagues.find((l) => l.leagueId === activeLeague) ?? null;

  return (
    <div className="mrc-page">
      <div className="mrc-hero">
        <h1>{t("Saha Muhabiri", "Field Reporter")}</h1>
        <p>
          {t(
            "API'lerin görmediği ligleri sen görünür kıl — her tamamlanan maç +100 Scores Puanı.",
            "Make the leagues APIs can't see visible — every completed match earns +100 Scores Points.",
          )}
        </p>
      </div>

      {msg && <div className="mrc-msg">{msg}</div>}

      {/* Atanmış ligler */}
      {me && me.leagues.length > 0 && (
        <section className="mrc-card">
          <h3 className="mrc-card-title">{t("Liglerim", "My Leagues")}</h3>
          <div className="mrc-league-tabs">
            {me.leagues.map((l) => (
              <button
                key={l.leagueId}
                className={`mrc-league-tab ${activeLeague === l.leagueId ? "is-active" : ""}`}
                onClick={() => setActiveLeague(l.leagueId)}
              >
                {l.leagueName}
                <span className="mrc-league-tab-meta">
                  {l.teamCount} {t("takım", "teams")} · {l.fixtureCount} {t("maç", "matches")}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {selected && (
        <LeaguePanel league={selected} lang={lang} onLeagueLogoChange={() => void loadMe()} />
      )}

      {/* Başvuru formu + geçmiş */}
      <section className="mrc-card">
        <h3 className="mrc-card-title">
          {t("Yeni Lig Başvurusu", "Apply for a New League")}
        </h3>
        <p className="mrc-hint">
          {t(
            "Hangi ligi girmek istiyorsun? Onaylanınca lig sana atanır ve veri girişine başlarsın.",
            "Which league do you want to cover? Once approved, the league is assigned to you.",
          )}
        </p>
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

        {me && me.applications.length > 0 && (
          <div className="mrc-apps">
            {me.applications.map((a) => (
              <div key={a.id} className="mrc-app">
                <span className="mrc-app-name">{a.leagueName}</span>
                <span className={`mrc-app-status s-${a.status.toLowerCase()}`}>
                  {a.status === "PENDING"
                    ? t("İncelemede", "Under review")
                    : a.status === "APPROVED"
                      ? t("Onaylandı", "Approved")
                      : t("Reddedildi", "Rejected")}
                </span>
                {a.reviewNote && <span className="mrc-app-note">{a.reviewNote}</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
