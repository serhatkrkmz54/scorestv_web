"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { matchPath } from "@/lib/routes";
import {
  IconBall,
  IconCard,
  IconCheck,
  IconChevronRight,
  IconClose,
  IconPlay,
  IconScreen,
  IconStop,
  IconSwap,
  IconTarget,
} from "@/components/icons";

/**
 * Maç yönetim masası — seçilen manuel maçın tam kontrolü:
 * Konsol (skorbord + durum + hızlı olay girişi) · Olaylar (zaman çizelgesi,
 * silme) · Kadro (ilk 11 + yedekler) · Yayın (kanal listesi).
 */

export interface DeskFixture {
  id: number;
  slug: string;
  kickoffAt: string;
  statusShort: string;
  elapsed: number | null;
  statusExtra: number | null;
  homeGoals: number | null;
  awayGoals: number | null;
  penHome: number | null;
  penAway: number | null;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  round: string | null;
}

interface EventView {
  id: number;
  minute: number | null;
  extra: number | null;
  type: string;
  detail: string | null;
  teamId: number | null;
  teamName: string | null;
  playerName: string | null;
  assistName: string | null;
}

interface LineupPlayer {
  name: string;
  number: number | null;
  position: string | null;
  substitute: boolean;
}

/** Canlı/ara fazlar — olay ve skor düzenlenebilir. */
const LIVE = new Set(["1H", "HT", "2H", "ET", "BT", "P", "INT", "SUSP"]);
/** Saatin işlediği fazlar. */
const RUNNING = new Set(["1H", "2H", "ET"]);
/** Puan kazandıran bitiş fazları. */
const FINISHED = new Set(["FT", "AET", "PEN"]);

const YELLOW_CARD = "#FBBF24";
const RED_CARD = "#EF4444";

const EVENT_TYPES: {
  key: string;
  tr: string;
  en: string;
  icon: ReactNode;
  needsAssist?: boolean;
}[] = [
  { key: "GOAL", tr: "Gol", en: "Goal", icon: <IconBall s={14} /> },
  { key: "PEN_GOAL", tr: "Penaltı Golü", en: "Penalty Goal", icon: <IconTarget s={14} /> },
  { key: "PEN_MISS", tr: "Kaçan Penaltı", en: "Missed Penalty", icon: <IconClose s={14} /> },
  { key: "OWN_GOAL", tr: "Kendi Kalesine", en: "Own Goal", icon: <IconBall s={14} className="ev-og" /> },
  { key: "YELLOW", tr: "Sarı Kart", en: "Yellow Card", icon: <IconCard s={13} color={YELLOW_CARD} /> },
  { key: "RED", tr: "Kırmızı Kart", en: "Red Card", icon: <IconCard s={13} color={RED_CARD} /> },
  { key: "SUB", tr: "Oyuncu Değişikliği", en: "Substitution", icon: <IconSwap s={14} />, needsAssist: true },
  { key: "VAR_GOAL_CANCELLED", tr: "VAR — Gol İptal", en: "VAR — Goal cancelled", icon: <IconScreen s={14} /> },
  { key: "VAR_PEN_CONFIRMED", tr: "VAR — Penaltı", en: "VAR — Penalty confirmed", icon: <IconScreen s={14} /> },
];

function eventIcon(ev: EventView): ReactNode {
  if (ev.type === "Goal") {
    if (ev.detail === "Own Goal") return <IconBall s={15} className="ev-og" />;
    if (ev.detail === "Penalty") return <IconTarget s={15} />;
    if (ev.detail === "Missed Penalty") return <IconClose s={15} />;
    return <IconBall s={15} />;
  }
  if (ev.type === "Card") {
    return <IconCard s={14} color={ev.detail === "Red Card" ? RED_CARD : YELLOW_CARD} />;
  }
  if (ev.type === "subst") return <IconSwap s={15} />;
  if (ev.type === "Var") return <IconScreen s={15} />;
  return null;
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });
  const data = (await r.json()) as T & { message?: string };
  if (!r.ok) throw new Error(data.message ?? "İşlem başarısız.");
  return data;
}

type Tab = "console" | "events" | "lineup" | "broadcast";

export function MatchDesk({
  fixture,
  lang,
  onFixtureUpdate,
  onClose,
}: {
  fixture: DeskFixture;
  lang: "tr" | "en";
  onFixtureUpdate: (f: DeskFixture) => void;
  onClose: () => void;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [tab, setTab] = useState<Tab>("console");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [events, setEvents] = useState<EventView[]>([]);

  const live = LIVE.has(fixture.statusShort);
  const done = FINISHED.has(fixture.statusShort);

  // ---- Canlı dakika: sunucu değeri (ManualLiveClockJob 30 sn'de bir işletir;
  // LeaguePanel listeyi periyodik tazeleyip fixture prop'unu günceller). ----
  const displayMinute = useMemo(() => {
    const st = fixture.statusShort;
    if (st === "HT") return t("DEVRE", "HT");
    if (st === "BT") return t("ARA", "BREAK");
    if (st === "P") return t("PENALTILAR", "PENS");
    if (st === "INT" || st === "SUSP") return t("DURDU", "PAUSED");
    if (fixture.elapsed != null && RUNNING.has(st)) {
      // Uzatma varsa 45+2' / 90+4' biçiminde göster (API maçlarıyla aynı).
      return fixture.statusExtra != null && fixture.statusExtra > 0
        ? `${fixture.elapsed}+${fixture.statusExtra}'`
        : `${fixture.elapsed}'`;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixture.elapsed, fixture.statusExtra, fixture.statusShort, lang]);

  const loadEvents = useCallback(async () => {
    try {
      const list = await jsonFetch<EventView[]>(`/api/reporter/fixtures/${fixture.id}/events`);
      setEvents(list);
    } catch {
      /* sessiz */
    }
  }, [fixture.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async veri cekimi (standart desen)
    void loadEvents();
  }, [loadEvents]);

  async function phaseAction(action: string, extraBody: Record<string, unknown> = {}) {
    setBusy(true);
    setMsg(null);
    try {
      const updated = await jsonFetch<DeskFixture>(
        `/api/reporter/fixtures/${fixture.id}/actions`,
        { method: "POST", body: JSON.stringify({ action, ...extraBody }) },
      );
      onFixtureUpdate(updated);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("İşlem başarısız.", "Action failed."));
    } finally {
      setBusy(false);
    }
  }

  // ---- Hakem ilanı (+dk) girişi ----
  const [stoppage, setStoppage] = useState("");

  /** Penaltı serisi skorunu güncelle (delta: -1/+1). */
  function penDelta(side: "home" | "away", delta: number) {
    const h = Math.max(0, (fixture.penHome ?? 0) + (side === "home" ? delta : 0));
    const a = Math.max(0, (fixture.penAway ?? 0) + (side === "away" ? delta : 0));
    void phaseAction("SET_PEN_SCORE", { homeGoals: h, awayGoals: a });
  }

  // ---- Olay formu ----
  const [evType, setEvType] = useState("GOAL");
  const [evTeam, setEvTeam] = useState<"HOME" | "AWAY">("HOME");
  const [evMinute, setEvMinute] = useState("");
  const [evExtra, setEvExtra] = useState("");
  const [evPlayer, setEvPlayer] = useState("");
  const [evAssist, setEvAssist] = useState("");
  const selectedType = EVENT_TYPES.find((e) => e.key === evType);

  async function submitEvent() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await jsonFetch<{ fixture: DeskFixture }>(
        `/api/reporter/fixtures/${fixture.id}/events`,
        {
          method: "POST",
          body: JSON.stringify({
            type: evType,
            team: evTeam,
            minute: evMinute ? Number(evMinute) : null,
            extra: evExtra ? Number(evExtra) : null,
            playerName: evPlayer.trim() || null,
            assistName: evAssist.trim() || null,
          }),
        },
      );
      onFixtureUpdate(res.fixture);
      setEvPlayer("");
      setEvAssist("");
      setEvMinute("");
      setEvExtra("");
      await loadEvents();
      setMsg(t("Olay eklendi.", "Event added."));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("Eklenemedi.", "Could not add."));
    } finally {
      setBusy(false);
    }
  }

  async function removeEvent(eventId: number) {
    if (!window.confirm(t("Olay silinsin mi? (Gol ise skor geri alınır)", "Delete event? (Score reverts if goal)"))) return;
    setBusy(true);
    try {
      const updated = await jsonFetch<DeskFixture>(
        `/api/reporter/fixtures/${fixture.id}/events/${eventId}`,
        { method: "DELETE" },
      );
      onFixtureUpdate(updated);
      await loadEvents();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("Silinemedi.", "Could not delete."));
    } finally {
      setBusy(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "console", label: t("Konsol", "Console") },
    { key: "events", label: t("Olaylar", "Events") + (events.length ? ` (${events.length})` : "") },
    { key: "lineup", label: t("Kadro", "Lineup") },
    { key: "broadcast", label: t("Yayın", "Broadcast") },
  ];

  return (
    <div className="desk">
      {/* Skorbord */}
      <div className="desk-board">
        <button className="desk-close" onClick={onClose} title={t("Kapat", "Close")}><IconClose s={15} /></button>
        <div className="desk-team home">
          {fixture.homeTeamLogo && (
            // eslint-disable-next-line @next/next/no-img-element -- muhabir logosu
            <img src={fixture.homeTeamLogo} alt="" className="desk-team-logo" />
          )}
          {fixture.homeTeamName}
        </div>
        <div className="desk-score">
          <span className="tnum">{fixture.homeGoals ?? "-"}</span>
          <i>:</i>
          <span className="tnum">{fixture.awayGoals ?? "-"}</span>
          {(fixture.statusShort === "P" || fixture.statusShort === "PEN") &&
            fixture.penHome != null && (
              <div className="desk-pen tnum">
                {t("Pen.", "Pens")} {fixture.penHome}-{fixture.penAway}
              </div>
            )}
          <div className={`desk-status ${live ? "is-live" : ""}`}>
            {live && <span className="live-dot pulse" />}
            {displayMinute ?? fixture.statusShort}
          </div>
        </div>
        <div className="desk-team away">
          {fixture.awayTeamLogo && (
            // eslint-disable-next-line @next/next/no-img-element -- muhabir logosu
            <img src={fixture.awayTeamLogo} alt="" className="desk-team-logo" />
          )}
          {fixture.awayTeamName}
        </div>
      </div>

      {msg && <div className="desk-msg">{msg}</div>}

      {/* Sekmeler */}
      <div className="desk-tabs">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            className={`desk-tab ${tab === tb.key ? "is-active" : ""}`}
            onClick={() => setTab(tb.key)}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* ======== KONSOL ======== */}
      {tab === "console" && (
        <div className="desk-body">
          <div className="desk-phase">
            {(fixture.statusShort === "NS" || fixture.statusShort === "PST") && (
              <>
                <button className="mrc-act go" disabled={busy} onClick={() => phaseAction("START")}>
                  <IconPlay s={11} /> {t("Maçı Başlat", "Start Match")}
                </button>
                {fixture.statusShort === "NS" && (
                  <button className="mrc-act" disabled={busy} onClick={() => phaseAction("POSTPONE")}>
                    {t("Ertele", "Postpone")}
                  </button>
                )}
                <button className="mrc-act warn" disabled={busy} onClick={() => phaseAction("CANCEL")}>
                  {t("İptal Et", "Cancel")}
                </button>
              </>
            )}
            {fixture.statusShort === "1H" && (
              <button className="mrc-act" disabled={busy} onClick={() => phaseAction("HT")}>
                {t("Devre Arası", "Halftime")}
              </button>
            )}
            {fixture.statusShort === "HT" && (
              <button className="mrc-act go" disabled={busy} onClick={() => phaseAction("SECOND_HALF")}>
                <IconPlay s={11} /> {t("2. Yarıyı Başlat", "Start 2nd Half")}
              </button>
            )}
            {fixture.statusShort === "2H" && (
              <>
                <button className="mrc-act" disabled={busy} onClick={() => phaseAction("BREAK")}>
                  {t("Uzatma Devresine Git", "Go to Extra Time")}
                </button>
                <button className="mrc-act" disabled={busy} onClick={() => phaseAction("PENALTIES")}>
                  {t("Penaltılara Geç", "Go to Penalties")}
                </button>
              </>
            )}
            {fixture.statusShort === "BT" && (
              <>
                <button className="mrc-act go" disabled={busy} onClick={() => phaseAction("EXTRA_TIME")}>
                  <IconPlay s={11} />{" "}
                  {fixture.elapsed != null && fixture.elapsed >= 105
                    ? t("2. Uzatma Devresi (106')", "2nd ET Half (106')")
                    : t("Uzatmayı Başlat (91')", "Start Extra Time (91')")}
                </button>
                <button className="mrc-act" disabled={busy} onClick={() => phaseAction("PENALTIES")}>
                  {t("Penaltılara Geç", "Go to Penalties")}
                </button>
              </>
            )}
            {fixture.statusShort === "ET" && (
              <>
                {fixture.elapsed != null && fixture.elapsed < 106 && (
                  <button className="mrc-act" disabled={busy} onClick={() => phaseAction("BREAK")}>
                    {t("Uzatma Devre Arası", "ET Halftime")}
                  </button>
                )}
                <button className="mrc-act" disabled={busy} onClick={() => phaseAction("PENALTIES")}>
                  {t("Penaltılara Geç", "Go to Penalties")}
                </button>
              </>
            )}
            {(fixture.statusShort === "INT" || fixture.statusShort === "SUSP") && (
              <>
                <button className="mrc-act go" disabled={busy} onClick={() => phaseAction("RESUME")}>
                  <IconPlay s={11} /> {t("Devam Ettir", "Resume")}
                </button>
                <button
                  className="mrc-act warn"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(t(
                      "Maç tatil edilsin mi? (Devam etmeyecek — puan verilmez)",
                      "Abandon match? (Will not continue — no points)",
                    ))) {
                      void phaseAction("ABANDON");
                    }
                  }}
                >
                  {t("Maçı Tatil Et", "Abandon")}
                </button>
              </>
            )}
            {RUNNING.has(fixture.statusShort) && (
              <button className="mrc-act" disabled={busy} onClick={() => phaseAction("PAUSE")}>
                {t("Maçı Durdur", "Pause Match")}
              </button>
            )}
            {live && fixture.statusShort !== "INT" && fixture.statusShort !== "SUSP" && (
              <button
                className="mrc-act warn"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(t("Maç bitirilsin mi? (+100 Scores Puanı)", "Finish match? (+100 points)"))) {
                    void phaseAction("FINISH");
                  }
                }}
              >
                <IconStop s={11} /> {t("Maçı Bitir", "Finish Match")}
              </button>
            )}
            {done && (
              <>
                <span className="mrc-done"><IconCheck s={13} /> {t("Maç tamamlandı · +100 puan", "Completed · +100 points")}</span>
                <Link href={matchPath(lang, fixture.slug)} className="mrc-fix-link">
                  {t("Maç sayfasını gör", "View match page")} <IconChevronRight s={12} />
                </Link>
              </>
            )}
            {fixture.statusShort === "ABD" && (
              <span className="mrc-empty">{t("Maç tatil edildi.", "Match abandoned.")}</span>
            )}
          </div>

          {/* Hakem ilanı: +dk (uzatma) — saat bu değerde tutulur */}
          {RUNNING.has(fixture.statusShort) && (
            <div className="desk-stoppage">
              <span className="desk-hint" style={{ margin: 0 }}>
                {t("Hakem ilanı:", "Announced:")}
              </span>
              <input
                className="ri-input"
                style={{ width: 72 }}
                type="number"
                min={0}
                max={15}
                value={stoppage}
                onChange={(e) => setStoppage(e.target.value)}
                placeholder="+dk"
                title={t("İlan edilen uzatma (ör. +5)", "Announced stoppage (e.g. +5)")}
              />
              <button
                className="mrc-act"
                disabled={busy || stoppage === ""}
                onClick={() => {
                  void phaseAction("SET_STOPPAGE", { minute: Number(stoppage) });
                  setStoppage("");
                }}
              >
                {t("Uzatmayı İşle", "Set Stoppage")}
              </button>
            </div>
          )}

          {/* Penaltı serisi skoru */}
          {fixture.statusShort === "P" && (
            <div className="desk-penpad">
              <div className="desk-pen-side">
                <span className="desk-pen-team">{fixture.homeTeamName}</span>
                <button className="mrc-act" disabled={busy} onClick={() => penDelta("home", -1)}>-</button>
                <b className="tnum">{fixture.penHome ?? 0}</b>
                <button className="mrc-act go" disabled={busy} onClick={() => penDelta("home", 1)}>
                  +1 {t("Gol", "Goal")}
                </button>
              </div>
              <div className="desk-pen-side">
                <span className="desk-pen-team">{fixture.awayTeamName}</span>
                <button className="mrc-act" disabled={busy} onClick={() => penDelta("away", -1)}>-</button>
                <b className="tnum">{fixture.penAway ?? 0}</b>
                <button className="mrc-act go" disabled={busy} onClick={() => penDelta("away", 1)}>
                  +1 {t("Gol", "Goal")}
                </button>
              </div>
              <p className="desk-hint">
                {t(
                  "Seri bitince Maçı Bitir'e bas — sonuç 'Penaltılarla' olarak işaretlenir.",
                  "When the shootout ends press Finish — result is marked 'after penalties'.",
                )}
              </p>
            </div>
          )}

          {/* Hızlı olay girişi — canlıyken */}
          {live && (
            <div className="desk-event-form">
              <div className="desk-event-types">
                {EVENT_TYPES.map((et) => (
                  <button
                    key={et.key}
                    className={`desk-etype ${evType === et.key ? "is-active" : ""}`}
                    onClick={() => setEvType(et.key)}
                  >
                    {et.icon} {lang === "tr" ? et.tr : et.en}
                  </button>
                ))}
              </div>
              <div className="desk-event-fields">
                <div className="desk-team-pick">
                  <button
                    className={`desk-side ${evTeam === "HOME" ? "is-active" : ""}`}
                    onClick={() => setEvTeam("HOME")}
                  >
                    {fixture.homeTeamName}
                  </button>
                  <button
                    className={`desk-side ${evTeam === "AWAY" ? "is-active" : ""}`}
                    onClick={() => setEvTeam("AWAY")}
                  >
                    {fixture.awayTeamName}
                  </button>
                </div>
                <input
                  className="ri-input"
                  style={{ width: 72 }}
                  type="number"
                  min={0}
                  max={130}
                  value={evMinute}
                  onChange={(e) => setEvMinute(e.target.value)}
                  placeholder={t("Dk", "Min")}
                />
                <input
                  className="ri-input"
                  style={{ width: 62 }}
                  type="number"
                  min={0}
                  max={15}
                  value={evExtra}
                  onChange={(e) => setEvExtra(e.target.value)}
                  placeholder="+"
                  title={t("Uzatma dakikası (ör. 90+3 için 3)", "Stoppage time (e.g. 3 for 90+3)")}
                />
                <input
                  className="ri-input"
                  value={evPlayer}
                  onChange={(e) => setEvPlayer(e.target.value)}
                  placeholder={
                    evType === "SUB" ? t("Çıkan oyuncu", "Player out") : t("Oyuncu adı", "Player name")
                  }
                />
                {(selectedType?.needsAssist || evType === "GOAL") && (
                  <input
                    className="ri-input"
                    value={evAssist}
                    onChange={(e) => setEvAssist(e.target.value)}
                    placeholder={evType === "SUB" ? t("Giren oyuncu", "Player in") : t("Asist (ops.)", "Assist (opt.)")}
                  />
                )}
                <button className="ri-submit" disabled={busy} onClick={submitEvent}>
                  {t("Ekle", "Add")}
                </button>
              </div>
              <p className="desk-hint">
                {t(
                  "Dakikayı boş bırakırsan maç saati kullanılır. Gol iptali için Olaylar sekmesinden golü sil, gerekirse VAR olayı ekle.",
                  "Leave minute empty to use match clock. To cancel a goal, delete it in Events and optionally add a VAR event.",
                )}
              </p>
            </div>
          )}

          {!live && !done && (
            <p className="desk-hint">
              {t(
                "Olay girişi maç başladıktan sonra açılır. Maç öncesi Kadro ve Yayın sekmelerini doldurabilirsin.",
                "Event entry opens after kickoff. Before the match you can fill Lineup and Broadcast tabs.",
              )}
            </p>
          )}
        </div>
      )}

      {/* ======== OLAYLAR ======== */}
      {tab === "events" && (
        <div className="desk-body">
          {events.length === 0 && <p className="mrc-empty">{t("Henüz olay yok.", "No events yet.")}</p>}
          <ul className="desk-timeline">
            {events.map((ev) => (
              <li key={ev.id} className="desk-tl-row">
                <span className="desk-tl-min tnum">
                  {ev.minute ?? "-"}{ev.extra ? `+${ev.extra}` : ""}&apos;
                </span>
                <span className="desk-tl-ic">{eventIcon(ev)}</span>
                <span className="desk-tl-body">
                  <b>{ev.playerName ?? ev.detail}</b>
                  {ev.assistName ? (
                    <span className="muted2"> {ev.type === "subst" ? "→ " : "· "}{ev.assistName}</span>
                  ) : null}
                  <span className="desk-tl-team">{ev.teamName}</span>
                </span>
                {!done && (
                  <button className="desk-tl-del" disabled={busy} onClick={() => removeEvent(ev.id)}>
                    {t("Sil", "Del")}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ======== KADRO ======== */}
      {tab === "lineup" && <LineupTab fixture={fixture} lang={lang} />}

      {/* ======== YAYIN ======== */}
      {tab === "broadcast" && <BroadcastTab fixture={fixture} lang={lang} />}
    </div>
  );
}

// ==================== Kadro sekmesi ====================

function LineupTab({ fixture, lang }: { fixture: DeskFixture; lang: "tr" | "en" }) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [side, setSide] = useState<"home" | "away">("home");
  const [formation, setFormation] = useState("");
  const [coach, setCoach] = useState("");
  const [startersText, setStartersText] = useState("");
  const [subsText, setSubsText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const l = await jsonFetch<{
        formation: string | null;
        coachName: string | null;
        players: LineupPlayer[];
      }>(`/api/reporter/fixtures/${fixture.id}/lineups/${side}`);
      setFormation(l.formation ?? "");
      setCoach(l.coachName ?? "");
      setStartersText(
        l.players.filter((p) => !p.substitute)
          .map((p) => `${p.number ?? ""} ${p.name}`.trim()).join("\n"),
      );
      setSubsText(
        l.players.filter((p) => p.substitute)
          .map((p) => `${p.number ?? ""} ${p.name}`.trim()).join("\n"),
      );
    } catch {
      /* sessiz */
    }
  }, [fixture.id, side]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async veri cekimi (standart desen)
    void load();
  }, [load]);

  /** "10 Arda Güler" satırını {number, name} olarak ayrıştırır. */
  function parseLines(text: string, substitute: boolean): { name: string; number: number | null; position: null; substitute: boolean }[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const m = /^(\d{1,2})\s+(.+)$/.exec(line);
        return m
          ? { name: m[2].trim(), number: Number(m[1]), position: null, substitute }
          : { name: line, number: null, position: null, substitute };
      });
  }

  async function save() {
    const players = [...parseLines(startersText, false), ...parseLines(subsText, true)];
    if (players.length === 0) {
      setMsg(t("En az bir oyuncu girin.", "Enter at least one player."));
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await jsonFetch(`/api/reporter/fixtures/${fixture.id}/lineups/${side}`, {
        method: "PUT",
        body: JSON.stringify({
          formation: formation.trim() || null,
          coachName: coach.trim() || null,
          players,
        }),
      });
      setMsg(t("Kadro kaydedildi — maç sayfasında görünür.", "Lineup saved — visible on match page."));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("Kaydedilemedi.", "Could not save."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="desk-body">
      <div className="desk-team-pick">
        <button className={`desk-side ${side === "home" ? "is-active" : ""}`} onClick={() => setSide("home")}>
          {fixture.homeTeamName}
        </button>
        <button className={`desk-side ${side === "away" ? "is-active" : ""}`} onClick={() => setSide("away")}>
          {fixture.awayTeamName}
        </button>
      </div>
      <div className="mrc-grid" style={{ marginTop: 12 }}>
        <input
          className="ri-input"
          value={formation}
          onChange={(e) => setFormation(e.target.value)}
          placeholder={t("Diziliş (ops.) — ör. 4-4-2", "Formation (opt.) — e.g. 4-4-2")}
        />
        <input
          className="ri-input"
          value={coach}
          onChange={(e) => setCoach(e.target.value)}
          placeholder={t("Teknik direktör (ops.)", "Coach (opt.)")}
        />
      </div>
      <div className="mrc-grid" style={{ marginTop: 10 }}>
        <div>
          <label className="ri-label">{t("İlk 11 — her satıra: No İsim", "Starting XI — per line: No Name")}</label>
          <textarea
            className="ri-input ri-textarea"
            rows={11}
            value={startersText}
            onChange={(e) => setStartersText(e.target.value)}
            placeholder={"1 Mert Kaya\n4 Ali Demir\n10 Emre Şahin"}
          />
        </div>
        <div>
          <label className="ri-label">{t("Yedekler", "Substitutes")}</label>
          <textarea
            className="ri-input ri-textarea"
            rows={11}
            value={subsText}
            onChange={(e) => setSubsText(e.target.value)}
            placeholder={"12 Burak Öz\n17 Can Aydın"}
          />
        </div>
      </div>
      {msg && <p className="desk-msg" style={{ marginTop: 10 }}>{msg}</p>}
      <button className="ri-submit" style={{ marginTop: 12 }} disabled={busy} onClick={save}>
        {busy ? t("Kaydediliyor…", "Saving…") : t("Kadroyu Kaydet", "Save Lineup")}
      </button>
    </div>
  );
}

// ==================== Yayın sekmesi ====================

function BroadcastTab({ fixture, lang }: { fixture: DeskFixture; lang: "tr" | "en" }) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [channels, setChannels] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    jsonFetch<{ channels: string[] }>(`/api/reporter/fixtures/${fixture.id}/broadcasts`)
      .then((b) => setChannels(b.channels))
      .catch(() => {});
  }, [fixture.id]);

  async function save(next: string[]) {
    setBusy(true);
    setMsg(null);
    try {
      const b = await jsonFetch<{ channels: string[] }>(
        `/api/reporter/fixtures/${fixture.id}/broadcasts`,
        { method: "PUT", body: JSON.stringify({ channels: next }) },
      );
      setChannels(b.channels);
      setMsg(t("Kaydedildi.", "Saved."));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("Kaydedilemedi.", "Could not save."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="desk-body">
      <p className="desk-hint">
        {t(
          "Maç nerede izlenebilir? Kanal veya platform adı ekle (ör. YouTube — Ankara ASKF, TRT Spor).",
          "Where can the match be watched? Add channel or platform names.",
        )}
      </p>
      <div className="mrc-team-list" style={{ marginTop: 8 }}>
        {channels.map((c) => (
          <span key={c} className="mrc-team">
            {c}
            <button
              className="desk-chip-x"
              disabled={busy}
              onClick={() => save(channels.filter((x) => x !== c))}
            >
              <IconClose s={10} />
            </button>
          </span>
        ))}
        {channels.length === 0 && <span className="mrc-empty">{t("Henüz kanal yok.", "No channels yet.")}</span>}
      </div>
      <div className="mrc-row">
        <input
          className="ri-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={100}
          placeholder={t("Kanal adı", "Channel name")}
        />
        <button
          className="ri-submit"
          disabled={busy || input.trim().length < 2}
          onClick={() => {
            const name = input.trim();
            if (!channels.includes(name)) void save([...channels, name]);
            setInput("");
          }}
        >
          {t("Ekle", "Add")}
        </button>
      </div>
      {msg && <p className="desk-msg" style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
