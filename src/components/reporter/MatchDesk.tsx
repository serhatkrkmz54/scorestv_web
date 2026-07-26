"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { matchPath } from "@/lib/routes";

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
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
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

const LIVE = new Set(["1H", "HT", "2H"]);

const EVENT_TYPES: { key: string; tr: string; en: string; icon: string; needsAssist?: boolean }[] = [
  { key: "GOAL", tr: "Gol", en: "Goal", icon: "⚽" },
  { key: "PEN_GOAL", tr: "Penaltı Golü", en: "Penalty Goal", icon: "🎯" },
  { key: "PEN_MISS", tr: "Kaçan Penaltı", en: "Missed Penalty", icon: "🚫" },
  { key: "OWN_GOAL", tr: "Kendi Kalesine", en: "Own Goal", icon: "🥅" },
  { key: "YELLOW", tr: "Sarı Kart", en: "Yellow Card", icon: "🟨" },
  { key: "RED", tr: "Kırmızı Kart", en: "Red Card", icon: "🟥" },
  { key: "SUB", tr: "Oyuncu Değişikliği", en: "Substitution", icon: "🔄", needsAssist: true },
  { key: "VAR_GOAL_CANCELLED", tr: "VAR — Gol İptal", en: "VAR — Goal cancelled", icon: "📺" },
  { key: "VAR_PEN_CONFIRMED", tr: "VAR — Penaltı", en: "VAR — Penalty confirmed", icon: "📺" },
];

function eventIcon(ev: EventView): string {
  if (ev.type === "Goal") {
    if (ev.detail === "Own Goal") return "🥅";
    if (ev.detail === "Penalty") return "🎯";
    if (ev.detail === "Missed Penalty") return "🚫";
    return "⚽";
  }
  if (ev.type === "Card") return ev.detail === "Red Card" ? "🟥" : "🟨";
  if (ev.type === "subst") return "🔄";
  if (ev.type === "Var") return "📺";
  return "•";
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
  const done = fixture.statusShort === "FT";

  // ---- Canlı dakika: sunucu değeri (ManualLiveClockJob 30 sn'de bir işletir;
  // LeaguePanel listeyi periyodik tazeleyip fixture prop'unu günceller). ----
  const displayMinute = useMemo(() => {
    if (fixture.statusShort === "HT") return t("DEVRE", "HT");
    if (
      fixture.elapsed != null &&
      (fixture.statusShort === "1H" || fixture.statusShort === "2H")
    ) {
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
      setMsg(t("Olay eklendi ✓", "Event added ✓"));
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
        <button className="desk-close" onClick={onClose} title={t("Kapat", "Close")}>✕</button>
        <div className="desk-team home">{fixture.homeTeamName}</div>
        <div className="desk-score">
          <span className="tnum">{fixture.homeGoals ?? "-"}</span>
          <i>:</i>
          <span className="tnum">{fixture.awayGoals ?? "-"}</span>
          <div className={`desk-status ${live ? "is-live" : ""}`}>
            {live && <span className="live-dot pulse" />}
            {displayMinute ?? fixture.statusShort}
          </div>
        </div>
        <div className="desk-team away">{fixture.awayTeamName}</div>
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
                  ▶ {t("Maçı Başlat", "Start Match")}
                </button>
                <button className="mrc-act" disabled={busy} onClick={() => phaseAction("POSTPONE")}>
                  {t("Ertele", "Postpone")}
                </button>
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
                ▶ {t("2. Yarıyı Başlat", "Start 2nd Half")}
              </button>
            )}
            {live && (
              <button
                className="mrc-act warn"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(t("Maç bitirilsin mi? (+100 Scores Puanı)", "Finish match? (+100 points)"))) {
                    void phaseAction("FINISH");
                  }
                }}
              >
                ■ {t("Maçı Bitir", "Finish Match")}
              </button>
            )}
            {done && (
              <>
                <span className="mrc-done">✓ {t("Maç tamamlandı · +100 puan", "Completed · +100 points")}</span>
                <Link href={matchPath(lang, fixture.slug)} className="mrc-fix-link">
                  {t("Maç sayfasını gör →", "View match page →")}
                </Link>
              </>
            )}
          </div>

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
      setMsg(t("Kadro kaydedildi ✓ — maç sayfasında görünür.", "Lineup saved ✓ — visible on match page."));
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
      setMsg(t("Kaydedildi ✓", "Saved ✓"));
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
              ✕
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
