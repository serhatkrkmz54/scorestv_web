"use client";

import { useState } from "react";
import { TeamLogo } from "@/components/shell/TeamLogo";
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

function playerPhoto(p: MatchLineupPlayer): string | null {
  return p.id != null
    ? `https://media.api-sports.io/football/players/${p.id}.png`
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

/**
 * Tek oyuncu hucresi — Avatar foto/initial fallback + parent ustunde forma no.
 * - Foto yuklenirse initials gizlenir (state ile).
 * - Forma numarasi .pitch-player container'inda absolute — avatar overflow:hidden
 *   gizlemiyor.
 */
function PlayerChip({ p }: { p: MatchLineupPlayer }) {
  const photo = playerPhoto(p);
  const surname = (p.name ?? "").split(" ").slice(-1)[0] ?? "";
  const [failed, setFailed] = useState(false);
  const showPhoto = photo != null && !failed;
  return (
    <div className="pitch-player">
      <div className="pitch-player-avatar">
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={p.name}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="pitch-player-initials">{initials(p.name)}</span>
        )}
      </div>
      <span className="pitch-player-name">{surname}</span>
    </div>
  );
}

function TeamHalf({
  team,
  side,
}: {
  team: MatchLineupView;
  side: "home" | "away";
}) {
  const rows = rowsOf(team);
  const ordered = side === "home" ? rows : [...rows].reverse();
  return (
    <div className={`pitch-half pitch-half-${side}`}>
      {ordered.map((players, ri) => (
        <div key={ri} className="pitch-col">
          {players.map((p, i) => (
            <PlayerChip key={(p.id ?? p.name) + "-" + i} p={p} />
          ))}
        </div>
      ))}
    </div>
  );
}

interface TeamCardProps {
  team: MatchTeam;
  lineup: MatchLineupView;
  lang: "tr" | "en";
}

function BenchPlayerAvatar({ p }: { p: MatchLineupPlayer }) {
  const photo = playerPhoto(p);
  const [failed, setFailed] = useState(false);
  if (photo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt={p.name} loading="lazy" onError={() => setFailed(true)} />
    );
  }
  return <span className="bench-initials">{initials(p.name)}</span>;
}

function TeamBenchCard({ team, lineup, lang }: TeamCardProps) {
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
          <span className="lineup-coach-label">
            {t("Teknik Direktor", "Coach")}
          </span>
          <span className="lineup-coach-name">{lineup.coach.name}</span>
        </div>
      ) : null}

      {subs.length > 0 ? (
        <>
          <div className="lineup-subs-head">
            {t("Yedekler", "Substitutes")}
          </div>
          <ul className="bench-list">
            {subs.map((p, i) => (
              <li
                key={(p.id ?? p.name ?? "p") + "-" + i}
                className="bench-row"
              >
                <span className="bench-avatar">
                  <BenchPlayerAvatar p={p} />
                </span>
                <span className="bench-num tnum">{p.number ?? "—"}</span>
                <span className="bench-name">{p.name}</span>
                {p.position ? (
                  <span className="bench-pos">
                    {positionLong(p.position, lang)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export function LineupsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const lineups = detail.lineups ?? [];

  if (lineups.length === 0) {
    return (
      <div className="match-tab match-tab-lineups">
        <section className="match-card">
          <p className="match-empty">
            {t(
              "Dizilis henuz aciklanmadi (genelde maca 20-40 dk kala)",
              "Lineups not yet announced (usually 20-40 mins before kickoff)",
            )}
          </p>
        </section>
      </div>
    );
  }

  const homeLineup =
    lineups.find((lu) => lu.teamId === detail.homeTeam.id) ?? lineups[0];
  const awayLineup =
    lineups.find((lu) => lu.teamId === detail.awayTeam.id) ?? lineups[1];

  return (
    <div className="match-tab match-tab-lineups">
      <section className="match-card">
        <header className="match-card-head pitch-head">
          <span className="pitch-head-team pitch-head-home">
            <TeamLogo
              name={detail.homeTeam.name}
              logo={detail.homeTeam.logo ?? null}
              size={22}
            />
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
            <TeamLogo
              name={detail.awayTeam.name}
              logo={detail.awayTeam.logo ?? null}
              size={22}
            />
          </span>
        </header>
        <div className="pitch pitch-h">
          <svg
            className="pitch-svg"
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
          >
            <line x1="50" y1="0" x2="50" y2="60" stroke="rgba(255,255,255,0.22)" strokeWidth="0.3" />
            <circle cx="50" cy="30" r="7" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.3" />
            <rect x="0" y="20" width="14" height="20" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.3" />
            <rect x="86" y="20" width="14" height="20" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.3" />
          </svg>
          <div className="pitch-halves">
            {homeLineup ? <TeamHalf team={homeLineup} side="home" /> : null}
            {awayLineup ? <TeamHalf team={awayLineup} side="away" /> : null}
          </div>
        </div>
      </section>

      <div className="lineup-bench-grid">
        {homeLineup ? (
          <TeamBenchCard team={detail.homeTeam} lineup={homeLineup} lang={lang} />
        ) : null}
        {awayLineup ? (
          <TeamBenchCard team={detail.awayTeam} lineup={awayLineup} lang={lang} />
        ) : null}
      </div>
    </div>
  );
}
