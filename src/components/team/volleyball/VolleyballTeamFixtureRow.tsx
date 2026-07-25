"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { volleyballMatchPath, volleyballTeamPath } from "@/lib/routes";
import { buildEntitySlug, buildMatchSlug } from "@/lib/slug-utils";
import type { VlTeamGameRef } from "@/lib/volleyball-team-types";

const LIVE = new Set(["S1", "S2", "S3", "S4", "S5", "LIVE"]);
const FT = new Set(["FT", "AW"]);

function formatStart(iso: string | null, lang: "tr" | "en"): string {
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

function Cell({
  team,
  side,
  lang,
}: {
  team: VlTeamGameRef["home"];
  side: "home" | "away";
  lang: "tr" | "en";
}) {
  const cls = `lig-fix-team lig-fix-${side}`;
  const name = <span className="lig-fix-name">{team.name}</span>;
  const logo = <TeamLogo name={team.name ?? ""} logo={team.logo ?? null} size={20} />;
  const inner = side === "home" ? (<>{name}{logo}</>) : (<>{logo}{name}</>);
  if (!team.id || !team.name) {
    return <span className={cls}>{inner}</span>;
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

export function VolleyballTeamFixtureRow({
  g,
  lang,
}: {
  g: VlTeamGameRef;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const code = g.statusShort ?? "";
  const live = LIVE.has(code);
  const finished = FT.has(code);
  const showScore =
    (live || finished) && g.homeSets != null && g.awaySets != null;
  const slug =
    g.slug ||
    (g.id && g.home.name && g.away.name
      ? buildMatchSlug(g.home.name, g.away.name, g.id)
      : null);
  const center = (
    <>
      <span className="lig-fix-time">
        {live ? (
          <span className="lig-fix-live">{t("CANLI", "LIVE")}</span>
        ) : (
          formatStart(g.kickoff, lang)
        )}
      </span>
      <span className={`lig-fix-score tnum ${live ? "is-live" : ""}`}>
        {showScore ? `${g.homeSets} - ${g.awaySets}` : "vs"}
      </span>
    </>
  );
  return (
    <div className="lig-fix-row">
      <Cell team={g.home} side="home" lang={lang} />
      {slug ? (
        <Link href={volleyballMatchPath(lang, slug)} className="lig-fix-center-link">
          {center}
        </Link>
      ) : (
        <span className="lig-fix-center-link">{center}</span>
      )}
      <Cell team={g.away} side="away" lang={lang} />
    </div>
  );
}
