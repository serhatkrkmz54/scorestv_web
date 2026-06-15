"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconClose, IconUser, IconChevronRight, IconSwap } from "@/components/icons";
import { playerPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import type {
  MatchDetailResponse,
  MatchLineupPlayer,
  MatchLineupView,
  MatchTeam,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

/** detail.playerStats icindeki tek oyuncu kaydinin ihtiyac duydugumuz alanlari. */
interface PStat {
  playerId: number;
  photo?: string | null;
  rating?: string | null;
  minutes?: number | null;
  number?: number | null;
  position?: string | null;
  goals?: { total?: number | null; assists?: number | null } | null;
  shots?: { total?: number | null; on?: number | null } | null;
  passes?: { accuracy?: string | number | null } | null;
  tackles?: { total?: number | null } | null;
  duels?: { total?: number | null; won?: number | null } | null;
  fouls?: { committed?: number | null } | null;
}

function playerPhoto(id: number | null | undefined): string | null {
  return id != null
    ? `https://media.api-sports.io/football/players/${id}.png`
    : null;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");
}

function surnameOf(name: string): string {
  return (name ?? "").split(" ").slice(-1)[0] ?? name ?? "";
}

function positionLong(pos: string | null | undefined, lang: "tr" | "en"): string {
  if (!pos) return "";
  const p = pos.toUpperCase();
  if (lang === "tr") {
    if (p === "G") return "Kaleci";
    if (p === "D") return "Defans";
    if (p === "M") return "Orta Saha";
    if (p === "F") return "Forvet";
  } else {
    if (p === "G") return "Goalkeeper";
    if (p === "D") return "Defender";
    if (p === "M") return "Midfielder";
    if (p === "F") return "Forward";
  }
  return pos;
}

/** Rating rengi — >=7.5 yesil, >=6.5 amber, alti kirmizi. */
function ratingColor(r: string | null | undefined): string {
  const v = r != null ? parseFloat(String(r)) : NaN;
  if (!isFinite(v)) return "#6b7280";
  if (v >= 7.5) return "#2e9e5b";
  if (v >= 6.5) return "#d39a16";
  return "#d9534f";
}

function ratingText(r: string | null | undefined): string | null {
  const v = r != null ? parseFloat(String(r)) : NaN;
  return isFinite(v) ? v.toFixed(1) : null;
}

/** Takim formasi rengi (#rrggbb) — gecersizse null. */
function parseColor(hex: string | null | undefined): string | null {
  if (!hex) return null;
  const c = hex.replace("#", "").trim();
  return /^[0-9a-fA-F]{6}$/.test(c) ? `#${c}` : null;
}

/** startXI'i grid satirlarina ayirir (yoksa formasyondan tahmin eder). */
function rowsOf(team: MatchLineupView): MatchLineupPlayer[][] {
  const rows: { rowIdx: number; players: MatchLineupPlayer[] }[] = [];
  for (const p of team.startXI) {
    const grid = (p.grid ?? "").split(":");
    const rowIdx = Number(grid[0]) || 1;
    let bucket = rows.find((r) => r.rowIdx === rowIdx);
    if (!bucket) {
      bucket = { rowIdx, players: [] };
      rows.push(bucket);
    }
    bucket.players.push(p);
  }
  rows.sort((a, b) => a.rowIdx - b.rowIdx);
  rows.forEach((r) => {
    r.players.sort((a, b) => {
      const ac = Number(a.grid?.split(":")[1]) || 0;
      const bc = Number(b.grid?.split(":")[1]) || 0;
      return ac - bc;
    });
  });
  if (rows.length === 0 && team.formation) {
    const parts = team.formation.split("-").map(Number);
    let idx = 0;
    rows.push({ rowIdx: 1, players: [team.startXI[idx++]].filter(Boolean) });
    parts.forEach((cnt, rowI) => {
      const pls: MatchLineupPlayer[] = [];
      for (let i = 0; i < cnt && idx < team.startXI.length; i++) {
        pls.push(team.startXI[idx++]);
      }
      rows.push({ rowIdx: rowI + 2, players: pls });
    });
  }
  return rows.map((r) => r.players);
}

// ---- Selected player (for the sheet) ----
interface Selected {
  player: MatchLineupPlayer;
  teamName: string;
  color: string;
  isSub: boolean;
}

/** Sahadaki tek oyuncu — tiklanabilir; foto/numara + opsiyonel rating pili. */
function PlayerChip({
  p,
  stat,
  onSelect,
}: {
  p: MatchLineupPlayer;
  stat: PStat | undefined;
  onSelect: () => void;
}) {
  const photo = playerPhoto(p.id);
  const [failed, setFailed] = useState(false);
  const showPhoto = photo != null && !failed;
  const rt = ratingText(stat?.rating);
  return (
    <button type="button" className="pitch-player" onClick={onSelect}>
      {/* Sarmalayici overflow:hidden DEGIL — numara/rating rozetleri daire
          kenarindan tasabilir, kirpilmaz. */}
      <span className="pitch-avatar-wrap">
        <span className="pitch-player-avatar">
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={p.name} loading="lazy" onError={() => setFailed(true)} />
          ) : (
            <span className="pitch-player-num-fallback">
              {p.number ?? initials(p.name)}
            </span>
          )}
        </span>
        {/* Foto varsa forma numarasi kose rozeti; foto yoksa zaten daire
            ortasinda buyuk gosteriliyor. */}
        {showPhoto && p.number != null ? (
          <span className="pitch-num-badge">{p.number}</span>
        ) : null}
        {rt ? (
          <span className="pitch-rating" style={{ backgroundColor: ratingColor(stat?.rating) }}>
            {rt}
          </span>
        ) : null}
      </span>
      <span className="pitch-player-name">{surnameOf(p.name)}</span>
    </button>
  );
}

function TeamHalf({
  team,
  side,
  color,
  statById,
  onSelect,
}: {
  team: MatchLineupView;
  side: "home" | "away";
  color: string;
  statById: Map<number, PStat>;
  onSelect: (p: MatchLineupPlayer) => void;
}) {
  const rows = rowsOf(team);
  // Ust yari (home): GK ustte → forvet ortaya. Alt yari (away): forvet ortada,
  // GK en altta → satirlari ters cevir.
  const ordered = side === "home" ? rows : [...rows].reverse();
  return (
    <div
      className={`pitch-side pitch-side-${side}`}
      style={{ "--chip-bg": color } as CSSProperties}
    >
      {ordered.map((players, ri) => (
        <div key={ri} className="pitch-row">
          {players.map((p, i) => (
            <PlayerChip
              key={(p.id ?? p.name) + "-" + i}
              p={p}
              stat={p.id != null ? statById.get(p.id) : undefined}
              onSelect={() => onSelect(p)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Oyuncuya tiklayinca acilan istatistik paneli (mobil bottom-sheet / desktop modal). */
function PlayerStatSheet({
  sel,
  stat,
  lang,
  onClose,
}: {
  sel: Selected;
  stat: PStat | undefined;
  lang: "tr" | "en";
  onClose: () => void;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const { player, teamName, color, isSub } = sel;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const photo = stat?.photo || playerPhoto(player.id);
  const [failed, setFailed] = useState(false);
  const minutes = stat?.minutes ?? 0;
  const played = !!stat && minutes > 0;
  const rt = ratingText(stat?.rating);

  const acc = stat?.passes?.accuracy;
  const cells: Array<{ v: string; l: string }> = played
    ? [
        { v: `${stat?.minutes ?? 0}'`, l: t("Dakika", "Minutes") },
        { v: `${stat?.goals?.total ?? 0}`, l: t("Gol", "Goals") },
        { v: `${stat?.goals?.assists ?? 0}`, l: t("Asist", "Assists") },
        { v: `${stat?.shots?.total ?? 0} (${stat?.shots?.on ?? 0})`, l: t("Şut", "Shots") },
        { v: acc != null && acc !== "" ? `${acc}%` : "-", l: t("Pas %", "Pass %") },
        { v: `${stat?.tackles?.total ?? 0}`, l: t("Top Kapma", "Tackles") },
        { v: `${stat?.duels?.won ?? 0}/${stat?.duels?.total ?? 0}`, l: t("İkili Müc.", "Duels") },
        { v: `${stat?.fouls?.committed ?? 0}`, l: t("Faul", "Fouls") },
      ]
    : [];

  const metaParts = [
    positionLong(player.position, lang),
    teamName,
  ].filter(Boolean);

  return (
    <div className="player-sheet-backdrop" onClick={onClose}>
      <div
        className="player-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={player.name}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="player-sheet-grip" />
        <button type="button" className="player-sheet-close" onClick={onClose} aria-label={t("Kapat", "Close")}>
          <IconClose s={18} />
        </button>

        <div className="player-sheet-head">
          <span className="player-sheet-ava" style={{ borderColor: color }}>
            {photo && !failed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={player.name} onError={() => setFailed(true)} />
            ) : (
              <span className="num" style={{ color }}>{player.number ?? initials(player.name)}</span>
            )}
          </span>
          <span className="player-sheet-id">
            <span className="player-sheet-name">{player.name}</span>
            {metaParts.length > 0 ? (
              <span className="player-sheet-meta">{metaParts.join(" · ")}</span>
            ) : null}
          </span>
          {rt ? (
            <span className="player-sheet-rating" style={{ backgroundColor: ratingColor(stat?.rating) }}>
              {rt}
            </span>
          ) : null}
        </div>

        {played ? (
          <div className="player-sheet-grid">
            {cells.map((c) => (
              <div key={c.l} className="player-sheet-cell">
                <span className="player-sheet-cell-val">{c.v}</span>
                <span className="player-sheet-cell-lbl">{c.l}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="player-sheet-empty">
            {isSub
              ? t("Oyuna çıkmadı", "Did not play")
              : t("Henüz istatistik verisi yok", "No stats yet")}
          </p>
        )}

        {player.id != null ? (
          <Link href={playerPath(lang, buildEntitySlug(player.name, player.id))} className="player-sheet-cta">
            <IconUser s={17} />
            {t("Tam profili gör", "View full profile")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

interface TeamCardProps {
  team: MatchTeam;
  lineup: MatchLineupView;
  color: string;
  lang: "tr" | "en";
  subInMinute: Map<number, number>;
  onSelect: (p: MatchLineupPlayer) => void;
}

function BenchPlayerAvatar({ p }: { p: MatchLineupPlayer }) {
  const photo = playerPhoto(p.id);
  const [failed, setFailed] = useState(false);
  if (photo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt={p.name} loading="lazy" onError={() => setFailed(true)} />
    );
  }
  return <span className="bench-initials">{p.number ?? initials(p.name)}</span>;
}

function TeamBenchCard({ team, lineup, color, lang, subInMinute, onSelect }: TeamCardProps) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const subs = lineup.substitutes ?? [];
  return (
    <section className="match-card lineup-team-card">
      <header className="match-card-head lineup-team-card-head">
        <TeamLogo name={team.name} logo={team.logo ?? null} size={22} />
        <h3>{team.name}</h3>
      </header>

      {lineup.coach?.name ? (
        <div className="lineup-coach-row">
          <span className="lineup-coach-label">{t("Teknik Direktor", "Coach")}</span>
          <span className="lineup-coach-name">{lineup.coach.name}</span>
        </div>
      ) : null}

      {subs.length > 0 ? (
        <>
          <div className="lineup-subs-head">{t("Yedekler", "Substitutes")}</div>
          <ul className="bench-list">
            {subs.map((p, i) => {
              const subMin = p.id != null ? subInMinute.get(p.id) : undefined;
              return (
                <li key={(p.id ?? p.name ?? "p") + "-" + i}>
                  <button
                    type="button"
                    className="bench-row"
                    onClick={() => onSelect(p)}
                    style={{ "--chip-bg": color } as CSSProperties}
                  >
                    <span className="bench-avatar">
                      <BenchPlayerAvatar p={p} />
                    </span>
                    <span className="bench-num tnum">{p.number ?? "—"}</span>
                    <span className="bench-name">{p.name}</span>
                    <span className="bench-meta">
                      {subMin != null ? (
                        <span className="bench-subin" title={t("Oyuna girdi", "Came on")}>
                          <IconSwap s={12} />
                          <span className="tnum">{subMin}&apos;</span>
                        </span>
                      ) : null}
                      {p.position ? (
                        <span className="bench-pos">{positionLong(p.position, lang)}</span>
                      ) : null}
                      <IconChevronRight s={16} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export function LineupsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const lineups = detail.lineups ?? [];
  const [sel, setSel] = useState<Selected | null>(null);
  // Mobilde yedekler tablı gosterilir; secili takim.
  const [benchTab, setBenchTab] = useState<"home" | "away">("home");

  // playerId -> stat haritasi (sheet + saha rating pili icin).
  const statById = useMemo(() => {
    const m = new Map<number, PStat>();
    for (const g of detail.playerStats ?? []) {
      for (const raw of g.players ?? []) {
        const p = raw as unknown as PStat;
        if (p && typeof p.playerId === "number") m.set(p.playerId, p);
      }
    }
    return m;
  }, [detail.playerStats]);

  // Oyuna giris dakikalari: subst event'inde giren oyuncu = assistId (mobil ile
  // ayni konvansiyon), dakika = elapsed.
  const subInMinute = useMemo(() => {
    const m = new Map<number, number>();
    for (const e of detail.events ?? []) {
      if ((e.type ?? "").toLowerCase() !== "subst") continue;
      if (e.assistId == null || e.elapsed == null) continue;
      m.set(e.assistId, e.elapsed);
    }
    return m;
  }, [detail.events]);

  if (lineups.length === 0) {
    return (
      <div className="match-tab match-tab-lineups">
        <section className="match-card">
          <p className="match-empty">
            {t(
              "Bu maç için diziliş verisi bulunmamaktadır.",
              "Lineups not yet announced.",
            )}
          </p>
        </section>
      </div>
    );
  }

  const homeLineup = lineups.find((lu) => lu.teamId === detail.homeTeam.id) ?? lineups[0];
  const awayLineup = lineups.find((lu) => lu.teamId === detail.awayTeam.id) ?? lineups[1];

  const homeColor = parseColor(homeLineup?.colors?.player?.primary) ?? "var(--accent)";
  const awayColor = parseColor(awayLineup?.colors?.player?.primary) ?? "#e07b39";

  const selectFrom = (
    p: MatchLineupPlayer,
    teamName: string,
    color: string,
    isSub: boolean,
  ) => setSel({ player: p, teamName, color, isSub });

  return (
    <div className="match-tab match-tab-lineups">
      <section className="match-card">
        <header className="match-card-head pitch-head">
          <span className="pitch-head-team pitch-head-home">
            <TeamLogo name={detail.homeTeam.name} logo={detail.homeTeam.logo ?? null} size={22} />
            <span>{detail.homeTeam.name}</span>
            {homeLineup?.formation ? (
              <span className="lineup-formation">{homeLineup.formation}</span>
            ) : null}
          </span>
          <span className="pitch-head-team pitch-head-away">
            {awayLineup?.formation ? (
              <span className="lineup-formation">{awayLineup.formation}</span>
            ) : null}
            <span>{detail.awayTeam.name}</span>
            <TeamLogo name={detail.awayTeam.name} logo={detail.awayTeam.logo ?? null} size={22} />
          </span>
        </header>

        <div className="pitch">
          {/* Dikey saha cizgileri (mobil) */}
          <svg className="pitch-svg pitch-svg-v" viewBox="0 0 60 100" preserveAspectRatio="none">
            <rect x="2" y="2" width="56" height="96" rx="3" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
            <line x1="2" y1="50" x2="58" y2="50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
            <circle cx="30" cy="50" r="8" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
            <rect x="18" y="2" width="24" height="13" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
            <rect x="18" y="85" width="24" height="13" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
          </svg>
          {/* Yatay saha cizgileri (masaustu) */}
          <svg className="pitch-svg pitch-svg-h" viewBox="0 0 100 60" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="56" rx="3" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
            <line x1="50" y1="2" x2="50" y2="58" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
            <circle cx="50" cy="30" r="8" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
            <rect x="2" y="17" width="13" height="26" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
            <rect x="85" y="17" width="13" height="26" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
          </svg>
          <div className="pitch-grid">
            {homeLineup ? (
              <TeamHalf
                team={homeLineup}
                side="home"
                color={homeColor}
                statById={statById}
                onSelect={(p) => selectFrom(p, detail.homeTeam.name, homeColor, false)}
              />
            ) : null}
            {awayLineup ? (
              <TeamHalf
                team={awayLineup}
                side="away"
                color={awayColor}
                statById={statById}
                onSelect={(p) => selectFrom(p, detail.awayTeam.name, awayColor, false)}
              />
            ) : null}
          </div>
        </div>
        <p className="lineup-hint">
          {t("Oyuncuya dokunarak istatistiklerini gör", "Tap a player to see their stats")}
        </p>
      </section>

      {/* Yedekler — mabilde tabli gecis (takim sec), masaustunde yan yana. */}
      <div className="bench-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={benchTab === "home"}
          className={"bench-tab" + (benchTab === "home" ? " active" : "")}
          onClick={() => setBenchTab("home")}
        >
          <TeamLogo name={detail.homeTeam.name} logo={detail.homeTeam.logo ?? null} size={20} />
          <span>{detail.homeTeam.name}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={benchTab === "away"}
          className={"bench-tab" + (benchTab === "away" ? " active" : "")}
          onClick={() => setBenchTab("away")}
        >
          <TeamLogo name={detail.awayTeam.name} logo={detail.awayTeam.logo ?? null} size={20} />
          <span>{detail.awayTeam.name}</span>
        </button>
      </div>
      <div className="lineup-bench-grid">
        {homeLineup ? (
          <div className={"bench-pane" + (benchTab === "home" ? " active" : "")}>
            <TeamBenchCard
              team={detail.homeTeam}
              lineup={homeLineup}
              color={homeColor}
              lang={lang}
              subInMinute={subInMinute}
              onSelect={(p) => selectFrom(p, detail.homeTeam.name, homeColor, true)}
            />
          </div>
        ) : null}
        {awayLineup ? (
          <div className={"bench-pane" + (benchTab === "away" ? " active" : "")}>
            <TeamBenchCard
              team={detail.awayTeam}
              lineup={awayLineup}
              color={awayColor}
              lang={lang}
              subInMinute={subInMinute}
              onSelect={(p) => selectFrom(p, detail.awayTeam.name, awayColor, true)}
            />
          </div>
        ) : null}
      </div>

      {sel ? (
        <PlayerStatSheet
          sel={sel}
          stat={sel.player.id != null ? statById.get(sel.player.id) : undefined}
          lang={lang}
          onClose={() => setSel(null)}
        />
      ) : null}
    </div>
  );
}
