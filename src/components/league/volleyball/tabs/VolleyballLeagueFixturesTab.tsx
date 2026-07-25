"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { volleyballMatchPath, volleyballTeamPath } from "@/lib/routes";
import { buildEntitySlug, buildMatchSlug } from "@/lib/slug-utils";
import type {
  VolleyballLeagueDetailResponse,
  VlGameSummary,
  VlTeamRef,
} from "@/lib/volleyball-league-types";

interface Props {
  detail: VolleyballLeagueDetailResponse;
  lang: "tr" | "en";
}

// Voleybol durum setleri — sport-scores.ts ile ayni kodlar.
const LIVE = new Set(["S1", "S2", "S3", "S4", "S5", "LIVE"]);
const FT = new Set(["FT", "AW"]);

function formatKickoff(iso: string | null, lang: "tr" | "en"): string {
  if (!iso) return "";
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

function TeamCell({
  team,
  side,
  lang,
}: {
  team: VlTeamRef;
  side: "home" | "away";
  lang: "tr" | "en";
}) {
  const cls = `lig-fix-team lig-fix-${side}`;
  const name = <span className="lig-fix-name">{team.name}</span>;
  const logo = <TeamLogo name={team.name ?? ""} logo={team.logo ?? null} size={20} />;
  const inner = side === "home" ? (<>{name}{logo}</>) : (<>{logo}{name}</>);
  if (!team.id || !team.name) {
    return (
      <span className={cls}>{inner}</span>
    );
  }
  return (
    <Link
      href={volleyballTeamPath(lang, buildEntitySlug(team.name, team.id))}
      className={cls}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  );
}

function GameRow({ g, lang }: { g: VlGameSummary; lang: "tr" | "en" }) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const code = g.statusShort ?? "";
  const live = LIVE.has(code);
  const finished = FT.has(code);
  const showScore =
    (live || finished) && g.homeSets != null && g.awaySets != null;
  const home = g.home;
  const away = g.away;
  if (!home || !away) return null;
  const slug =
    g.slug ??
    (g.id && home.name && away.name
      ? buildMatchSlug(home.name, away.name, g.id)
      : null);
  const center = (
    <>
      <span className="lig-fix-time">
        {live ? (
          <span className="lig-fix-live">{t("CANLI", "LIVE")}</span>
        ) : (
          formatKickoff(g.kickoff, lang)
        )}
      </span>
      <span className={`lig-fix-score tnum ${live ? "is-live" : ""}`}>
        {showScore ? `${g.homeSets} - ${g.awaySets}` : "vs"}
      </span>
    </>
  );
  return (
    <div className="lig-fix-row">
      <TeamCell team={home} side="home" lang={lang} />
      {slug ? (
        <Link href={volleyballMatchPath(lang, slug)} className="lig-fix-center-link">
          {center}
        </Link>
      ) : (
        <span className="lig-fix-center-link">{center}</span>
      )}
      <TeamCell team={away} side="away" lang={lang} />
    </div>
  );
}

export function VolleyballLeagueFixturesTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const upcoming = detail.upcomingGames ?? [];
  const recent = detail.recentGames ?? [];
  const [mode, setMode] = useState<"upcoming" | "recent">(
    upcoming.length > 0 ? "upcoming" : "recent",
  );

  if (upcoming.length === 0 && recent.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Fikstür yok", "No fixtures")}</p>
        </section>
      </div>
    );
  }

  const list = mode === "upcoming" ? upcoming : recent;
  return (
    <div className="match-tab">
      <div className="standings-group-tabs-wrap">
        <div className="standings-group-tabs">
          <button
            type="button"
            onClick={() => setMode("upcoming")}
            className={`standings-group-tab ${mode === "upcoming" ? "is-active" : ""}`}
          >
            {t("Yaklaşan", "Upcoming")}
          </button>
          <button
            type="button"
            onClick={() => setMode("recent")}
            className={`standings-group-tab ${mode === "recent" ? "is-active" : ""}`}
          >
            {t("Son Maçlar", "Recent")}
          </button>
        </div>
      </div>
      <section className="match-card">
        <ul className="lig-fix-list">
          {list.map((g, idx) => (
            <li key={`${g.id}-${idx}`}>
              <GameRow g={g} lang={lang} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
