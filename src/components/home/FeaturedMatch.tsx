"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useHome } from "@/context/home-context";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { categorize, kickoffTime, liveClock, winnerSide } from "@/lib/fixtures";
import { matchPath } from "@/lib/routes";
import type { FixtureSummary, PopularLeague } from "@/lib/fixtures-types";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconChevronsRight } from "@/components/icons";

function FeatRow({ f }: { f: FixtureSummary }) {
  const { lang } = useLang();
  const cat = categorize(f.status);
  const isLive = cat === "live";
  const isUpcoming = cat === "upcoming";
  const winner = isUpcoming ? null : winnerSide(f.score);
  const homeLost = winner === "away";
  const awayLost = winner === "home";

  return (
    <Link href={matchPath(lang, f.slug)} className="feat-match">
      <div className="fm-row">
        <div className={"fm-side home" + (homeLost ? " lost" : "")}>
          <span className="fm-nm">{f.homeTeam.name}</span>
          <TeamLogo name={f.homeTeam.name} logo={f.homeTeam.logo} size={26} />
        </div>

        <div className="fm-score">
          {isUpcoming ? (
            <span className="fm-time tnum">{kickoffTime(f.kickoff)}</span>
          ) : (
            <span className="sc tnum">
              <b className={homeLost ? "lose" : ""}>{f.score.home ?? 0}</b>
              <i>:</i>
              <b className={awayLost ? "lose" : ""}>{f.score.away ?? 0}</b>
            </span>
          )}
          {isLive && (
            <span className="fm-min tnum">
              <span className="live-dot pulse" />
              {liveClock(f.status)}
            </span>
          )}
        </div>

        <div className={"fm-side away" + (awayLost ? " lost" : "")}>
          <TeamLogo name={f.awayTeam.name} logo={f.awayTeam.logo} size={26} />
          <span className="fm-nm">{f.awayTeam.name}</span>
        </div>
      </div>
      <div className="fm-league">
        {f.leagueRef.name}
        {f.round ? ` · ${f.round}` : ""}
      </div>
    </Link>
  );
}

export function FeaturedMatch() {
  const { day } = useHome();
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [popularIds, setPopularIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const r = await fetch(`/api/leagues/popular?lang=${lang}`, { cache: "no-store" });
        if (!r.ok) return;
        const data = (await r.json()) as PopularLeague[];
        if (active) setPopularIds(new Set(data.map((l) => l.id)));
      } catch {
        // yut
      }
    })();
    return () => {
      active = false;
    };
  }, [lang]);

  // Popüler liglerin maçları (yoksa tümü); öne çıkanlar: canlı → yaklaşan → biten.
  const featured = useMemo<FixtureSummary[]>(() => {
    if (!day) return [];
    const popular: FixtureSummary[] = [];
    const all: FixtureSummary[] = [];
    day.leagues.forEach((g) => {
      g.fixtures.forEach((f) => {
        all.push(f);
        if (popularIds.has(g.league.id)) popular.push(f);
      });
    });
    const pool = popular.length > 0 ? popular : all;
    const rank = (f: FixtureSummary) => {
      const c = categorize(f.status);
      return c === "live" ? 0 : c === "upcoming" ? 1 : 2;
    };
    return [...pool]
      .sort((a, b) => rank(a) - rank(b) || a.kickoff.localeCompare(b.kickoff))
      .slice(0, 2);
  }, [day, popularIds]);

  if (featured.length === 0) return null;

  return (
    <div className="feat">
      <div className="feat-top">
        <span className="flame">
          <IconChevronsRight s={15} />
        </span>
        <span>{t.featured}</span>
      </div>
      {featured.map((f) => (
        <FeatRow key={f.id} f={f} />
      ))}
    </div>
  );
}
