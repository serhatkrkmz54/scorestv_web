"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { matchPath } from "@/lib/routes";
import Link from "next/link";

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
}
interface FixtureView {
  id: number;
  slug: string;
  kickoffAt: string;
  statusShort: string;
  elapsed: number | null;
  homeGoals: number | null;
  awayGoals: number | null;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  round: string | null;
}

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

// ==================== Canlı maç kartı ====================

function FixtureCard({
  f,
  lang,
  onAction,
  busy,
}: {
  f: FixtureView;
  lang: "tr" | "en";
  onAction: (id: number, body: Record<string, unknown>) => void;
  busy: boolean;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const live = LIVE.has(f.statusShort);
  const done = f.statusShort === "FT";
  return (
    <div className="mrc-fixture">
      <div className="mrc-fix-head">
        <span className="mrc-fix-teams">
          {f.homeTeamName} <b className="tnum">{f.homeGoals ?? "-"}</b>
          <i>:</i>
          <b className="tnum">{f.awayGoals ?? "-"}</b> {f.awayTeamName}
        </span>
        <span className={`mrc-fix-status ${live ? "is-live" : ""}`}>
          {live && <span className="live-dot pulse" />}
          {f.statusShort}
          {live && f.elapsed != null ? ` · ${f.elapsed}'` : ""}
        </span>
      </div>
      <div className="mrc-fix-meta">
        {fmtKickoff(f.kickoffAt, lang)}
        {f.round ? ` · ${f.round}` : ""}
        {done && (
          <Link href={matchPath(lang, f.slug)} className="mrc-fix-link">
            {t("Maç sayfası →", "Match page →")}
          </Link>
        )}
      </div>
      <div className="mrc-fix-actions">
        {f.statusShort === "NS" || f.statusShort === "PST" ? (
          <>
            <button className="mrc-act go" disabled={busy} onClick={() => onAction(f.id, { action: "START" })}>
              ▶ {t("Başlat", "Start")}
            </button>
            <button className="mrc-act" disabled={busy} onClick={() => onAction(f.id, { action: "POSTPONE" })}>
              {t("Ertele", "Postpone")}
            </button>
            <button className="mrc-act warn" disabled={busy} onClick={() => onAction(f.id, { action: "CANCEL" })}>
              {t("İptal", "Cancel")}
            </button>
          </>
        ) : null}
        {live ? (
          <>
            <button className="mrc-act go" disabled={busy} onClick={() => onAction(f.id, { action: "GOAL_HOME" })}>
              +1 {t("Ev", "Home")}
            </button>
            <button className="mrc-act go" disabled={busy} onClick={() => onAction(f.id, { action: "GOAL_AWAY" })}>
              +1 {t("Dep", "Away")}
            </button>
            {f.statusShort === "1H" && (
              <button className="mrc-act" disabled={busy} onClick={() => onAction(f.id, { action: "HT" })}>
                {t("Devre", "Halftime")}
              </button>
            )}
            {f.statusShort === "HT" && (
              <button className="mrc-act" disabled={busy} onClick={() => onAction(f.id, { action: "SECOND_HALF" })}>
                {t("2. Yarı", "2nd Half")}
              </button>
            )}
            <button
              className="mrc-act"
              disabled={busy}
              onClick={() => {
                const m = window.prompt(t("Dakika (0-130):", "Minute (0-130):"), String(f.elapsed ?? ""));
                if (m == null) return;
                onAction(f.id, { action: "SET_ELAPSED", minute: Number(m) });
              }}
            >
              {t("Dakika", "Minute")}
            </button>
            <button
              className="mrc-act"
              disabled={busy}
              onClick={() => {
                const h = window.prompt(t("Ev sahibi gol:", "Home goals:"), String(f.homeGoals ?? 0));
                if (h == null) return;
                const a = window.prompt(t("Deplasman gol:", "Away goals:"), String(f.awayGoals ?? 0));
                if (a == null) return;
                onAction(f.id, { action: "SET_SCORE", homeGoals: Number(h), awayGoals: Number(a) });
              }}
            >
              {t("Skor Düzelt", "Fix Score")}
            </button>
            <button
              className="mrc-act warn"
              disabled={busy}
              onClick={() => {
                if (window.confirm(t("Maç bitirilsin mi? (+100 Scores Puanı)", "Finish the match? (+100 Scores Points)"))) {
                  onAction(f.id, { action: "FINISH" });
                }
              }}
            >
              ■ {t("Bitir", "Finish")}
            </button>
          </>
        ) : null}
        {done && <span className="mrc-done">✓ {t("Tamamlandı · +100 puan", "Completed · +100 points")}</span>}
      </div>
    </div>
  );
}

// ==================== Lig paneli ====================

function LeaguePanel({ league, lang }: { league: AssignedLeague; lang: "tr" | "en" }) {
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
    void load();
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

  async function fixtureAction(id: number, body: Record<string, unknown>) {
    setBusy(true);
    setMsg(null);
    try {
      const updated = await post<FixtureView>(`/api/reporter/fixtures/${id}/actions`, body);
      setFixtures((fs) => fs.map((f) => (f.id === updated.id ? updated : f)));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("İşlem başarısız.", "Action failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mrc-league">
      <h2 className="mrc-league-title">{league.leagueName}</h2>
      {msg && <p className="ri-error">{msg}</p>}

      <div className="mrc-grid">
        {/* Takımlar */}
        <section className="mrc-card">
          <h3 className="mrc-card-title">{t("Takımlar", "Teams")} ({teams.length})</h3>
          <div className="mrc-team-list">
            {teams.map((tm) => (
              <span key={tm.id} className="mrc-team">{tm.name}</span>
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

      {/* Fikstür + canlı konsol */}
      <section className="mrc-card" style={{ marginTop: 14 }}>
        <h3 className="mrc-card-title">{t("Maçlar", "Matches")} ({fixtures.length})</h3>
        {fixtures.length === 0 && (
          <span className="mrc-empty">{t("Henüz maç yok.", "No matches yet.")}</span>
        )}
        {fixtures.map((f) => (
          <FixtureCard key={f.id} f={f} lang={lang} onAction={fixtureAction} busy={busy} />
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

      {selected && <LeaguePanel league={selected} lang={lang} />}

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
