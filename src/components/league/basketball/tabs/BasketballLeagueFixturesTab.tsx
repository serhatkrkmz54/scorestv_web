"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { basketballMatchPath, basketballTeamPath } from "@/lib/routes";
import { buildEntitySlug, buildMatchSlug } from "@/lib/slug-utils";
import type {
  BasketballLeagueDetailResponse,
  BkGameSummary,
  BkTeamRef,
} from "@/lib/basketball-league-types";

interface Props {
  detail: BasketballLeagueDetailResponse;
  lang: "tr" | "en";
}

const LIVE = new Set(["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT", "LIVE"]);
const FT = new Set(["FT", "AOT"]);

function formatKickoff(iso: string | null, lang: "tr" | "en"): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
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
  team: BkTeamRef;
  side: "home" | "away";
  lang: "tr" | "en";
}) {
  const cls = `lig-fix-team lig-fix-${side}`;
  const name = <span className="lig-fix-name">{team.name}</span>;
  const logo = <TeamLogo name={team.name} logo={team.logo ?? null} size={20} />;
  const inner = side === "home" ? (<>{name}{logo}</>) : (<>{logo}{name}</>);
  const slug = team.slug ?? buildEntitySlug(team.name, team.id);
  return (
    <Link
      href={basketballTeamPath(lang, slug)}
      className={cls}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  );
}

function GameRow({ g, lang }: { g: BkGameSummary; lang: "tr" | "en" }) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const code = g.statusShort ?? "";
  const live = LIVE.has(code);
  const finished = FT.has(code);
  const showScore =
    (live || finished) && g.homeTotal != null && g.awayTotal != null;
  const slug =
    g.slug ?? buildMatchSlug(g.homeTeam.name, g.awayTeam.name, g.id);
  return (
    <div className="lig-fix-row">
      <TeamCell team={g.homeTeam} side="home" lang={lang} />
      <Link href={basketballMatchPath(lang, slug)} className="lig-fix-center-link">
        <span className="lig-fix-time">
          {live ? (
            <span className="lig-fix-live">{t("CANLI", "LIVE")}</span>
          ) : (
            formatKickoff(g.kickoff, lang)
          )}
        </span>
        <span className={`lig-fix-score tnum ${live ? "is-live" : ""}`}>
          {showScore ? `${g.homeTotal} - ${g.awayTotal}` : "vs"}
        </span>
      </Link>
      <TeamCell team={g.awayTeam} side="away" lang={lang} />
    </div>
  );
}

export function BasketballLeagueFixturesTab({ detail, lang }: Props) {
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
