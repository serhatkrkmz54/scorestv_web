"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import {
  categorizeSport,
  sportStatusLabelShort,
  startTime,
  sportWinnerSide,
} from "@/lib/sport-scores";
import {
  volleyballMatchPath,
  volleyballLeaguePath,
  volleyballTeamPath,
} from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconChevronsRight } from "@/components/icons";
import type {
  SportDayResponse,
  VolleyballGameSummary,
  SportTeam,
} from "@/lib/sport-scores-types";
import type { Lang } from "@/i18n/auth-strings";

/**
 * Voleybol sag rayi — basketbol {@link BasketballRightRail}'in voleybol esi.
 * Sadece "One Cikan Maclar" blogu (voleybol icin haber kaynagi yok; mock da
 * koymuyoruz). Bugunun maclarindan canli > yaklasan > biten sirali ilk 2.
 */
function FmSide({
  team,
  side,
  lost,
  lang,
}: {
  team: SportTeam;
  side: "home" | "away";
  lost: boolean;
  lang: Lang;
}) {
  const cls = `fm-side ${side}${lost ? " lost" : ""}`;
  const name = <span className="fm-nm">{team.name}</span>;
  const logo = <TeamLogo name={team.name} logo={team.logo} size={26} />;
  const inner = side === "home" ? (<>{name}{logo}</>) : (<>{logo}{name}</>);
  if (team.id) {
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
  return <div className={cls}>{inner}</div>;
}

function FeatRow({ g, lang }: { g: VolleyballGameSummary; lang: Lang }) {
  const cat = categorizeSport("volleyball", g.status);
  const isLive = cat === "live";
  const isUpcoming = cat === "upcoming";
  const isCancelled = cat === "cancelled";
  const winner = isUpcoming || isCancelled ? null : sportWinnerSide(g);
  const homeLost = winner === "away";
  const awayLost = winner === "home";
  const leagueSlug = g.league.id
    ? volleyballLeaguePath(lang, buildEntitySlug(g.league.name, g.league.id))
    : null;

  return (
    <div className="feat-match">
      <div className="fm-row">
        <FmSide team={g.home} side="home" lost={homeLost} lang={lang} />

        <Link href={volleyballMatchPath(lang, g.slug)} className="fm-score">
          {isUpcoming ? (
            <span className="fm-time tnum">{startTime(g.startAt)}</span>
          ) : isCancelled ? (
            <span className="fm-time fm-canc">{sportStatusLabelShort("volleyball", g.status, lang)}</span>
          ) : (
            <span className={"sc tnum" + (isLive ? " is-live" : "")}>
              <b className={homeLost ? "lose" : ""}>{g.score.homeTotal ?? 0}</b>
              <i>:</i>
              <b className={awayLost ? "lose" : ""}>{g.score.awayTotal ?? 0}</b>
            </span>
          )}
          {isLive && (
            <span className="fm-min tnum">
              <span className="live-dot pulse" />
              {sportStatusLabelShort("volleyball", g.status, lang)}
            </span>
          )}
        </Link>

        <FmSide team={g.away} side="away" lost={awayLost} lang={lang} />
      </div>
      {leagueSlug ? (
        <Link
          href={leagueSlug}
          className="fm-league"
          onClick={(e) => e.stopPropagation()}
        >
          {g.league.name}
        </Link>
      ) : (
        <div className="fm-league">{g.league.name}</div>
      )}
    </div>
  );
}

export function VolleyballRightRail() {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [day, setDay] = useState<SportDayResponse | null>(null);

  useEffect(() => {
    let active = true;
    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/volleyball/fixtures?date=${today}&status=all&lang=${lang}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? (r.json() as Promise<SportDayResponse>) : null))
      .then((d) => {
        if (active && d) setDay(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lang]);

  const featured = useMemo<VolleyballGameSummary[]>(() => {
    if (!day) return [];
    const all: VolleyballGameSummary[] = [];
    day.leagues.forEach((grp) => {
      grp.games.forEach((game) => {
        if (game.sport !== "volleyball") return;
        all.push(game);
      });
    });
    const rank = (g: VolleyballGameSummary) => {
      const c = categorizeSport("volleyball", g.status);
      return c === "live" ? 0 : c === "upcoming" ? 1 : 2;
    };
    return [...all]
      .sort((a, b) => rank(a) - rank(b) || a.startAt.localeCompare(b.startAt))
      .slice(0, 2);
  }, [day]);

  if (featured.length === 0) return null;

  return (
    <div className="feat">
      <div className="feat-top">
        <span className="flame">
          <IconChevronsRight s={15} />
        </span>
        <span>{t.featured}</span>
      </div>
      {featured.map((g) => (
        <FeatRow key={g.id} g={g} lang={lang} />
      ))}
    </div>
  );
}
