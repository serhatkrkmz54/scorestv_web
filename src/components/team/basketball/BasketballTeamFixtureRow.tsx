"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { basketballMatchPath, basketballTeamPath } from "@/lib/routes";
import { buildEntitySlug, buildMatchSlug } from "@/lib/slug-utils";
import type {
  BkFixtureItem,
  BkTeamRefDetail,
} from "@/lib/basketball-team-types";

const LIVE = new Set(["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT", "LIVE"]);
const FT = new Set(["FT", "AOT"]);

function formatStart(iso: string | null, lang: "tr" | "en"): string {
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

function Cell({
  team,
  side,
  lang,
}: {
  team: BkTeamRefDetail;
  side: "home" | "away";
  lang: "tr" | "en";
}) {
  const cls = `lig-fix-team lig-fix-${side}`;
  const name = <span className="lig-fix-name">{team.displayName ?? team.name}</span>;
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

export function BasketballTeamFixtureRow({
  g,
  lang,
}: {
  g: BkFixtureItem;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const code = g.statusShort ?? "";
  const live = LIVE.has(code);
  const finished = FT.has(code);
  const showScore =
    (live || finished) && g.homeScore != null && g.awayScore != null;
  const slug = g.slug ?? buildMatchSlug(g.home.name, g.away.name, g.id);
  return (
    <div className="lig-fix-row">
      <Cell team={g.home} side="home" lang={lang} />
      <Link href={basketballMatchPath(lang, slug)} className="lig-fix-center-link">
        <span className="lig-fix-time">
          {live ? (
            <span className="lig-fix-live">{t("CANLI", "LIVE")}</span>
          ) : (
            formatStart(g.startAt, lang)
          )}
        </span>
        <span className={`lig-fix-score tnum ${live ? "is-live" : ""}`}>
          {showScore ? `${g.homeScore} - ${g.awayScore}` : "vs"}
        </span>
      </Link>
      <Cell team={g.away} side="away" lang={lang} />
    </div>
  );
}
