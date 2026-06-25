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
  basketballMatchPath,
  basketballLeaguePath,
  basketballTeamPath,
} from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import { colorFromName } from "@/lib/fixtures";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconChevronsRight } from "@/components/icons";
import type {
  SportDayResponse,
  BasketballGameSummary,
  SportTeam,
} from "@/lib/sport-scores-types";
import type { Lang } from "@/i18n/auth-strings";

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
        href={basketballTeamPath(lang, buildEntitySlug(team.name, team.id))}
        className={cls}
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

function FeatRow({ g, lang }: { g: BasketballGameSummary; lang: Lang }) {
  const cat = categorizeSport("basketball", g.status);
  const isLive = cat === "live";
  const isUpcoming = cat === "upcoming";
  const winner = isUpcoming ? null : sportWinnerSide(g);
  const homeLost = winner === "away";
  const awayLost = winner === "home";
  const leagueSlug = g.league.id
    ? basketballLeaguePath(lang, buildEntitySlug(g.league.name, g.league.id))
    : null;

  return (
    <div className="feat-match">
      <div className="fm-row">
        <FmSide team={g.home} side="home" lost={homeLost} lang={lang} />

        <Link href={basketballMatchPath(lang, g.slug)} className="fm-score">
          {isUpcoming ? (
            <span className="fm-time tnum">{startTime(g.startAt)}</span>
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
              {sportStatusLabelShort("basketball", g.status, lang)}
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

// Bugunun basketbol maclarindan one cikan(lar)i secer. Populer lig id'leri
// doluysa onları onceliklendirir; canli > yaklasan > biten siralamasi.
function BasketballFeaturedMatch() {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [day, setDay] = useState<SportDayResponse | null>(null);

  useEffect(() => {
    let active = true;
    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/basketball/fixtures?date=${today}&status=all&lang=${lang}`, {
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

  const featured = useMemo<BasketballGameSummary[]>(() => {
    if (!day) return [];
    // Populer lig kuratorlugu artik BACKEND'de (serving.popular-league-ids);
    // burada bugunun tum basketbol maclarindan canli > yaklasan > biten
    // siralamasiyla one cikan(lar)i seciyoruz.
    const all: BasketballGameSummary[] = [];
    day.leagues.forEach((grp) => {
      grp.games.forEach((game) => {
        if (game.sport !== "basketball") return;
        all.push(game);
      });
    });
    const rank = (g: BasketballGameSummary) => {
      const c = categorizeSport("basketball", g.status);
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

// Statik mockup haber kartlari — gercek kaynak yok. Futbol NewsList card
// stilini (rl-section / nl-item) yeniden kullanir. Backend basketbol haber
// ucu eklenince buradan beslenmeyecek.
interface MockBkNews {
  title_tr: string;
  title_en: string;
  category_tr: string;
  category_en: string;
  time_tr: string;
  time_en: string;
  seed: string;
}

const MOCK_BK_NEWS: MockBkNews[] = [
  {
    title_tr: "EuroLeague'de Final Four heyecanı: Eşleşmeler belli oldu",
    title_en: "EuroLeague Final Four set: Matchups revealed",
    category_tr: "EuroLeague",
    category_en: "EuroLeague",
    time_tr: "22 dk önce",
    time_en: "22 min ago",
    seed: "euroleague",
  },
  {
    title_tr: "NBA'de gecenin maçı: Çift sayı üçlü-double ile galibiyet",
    title_en: "NBA night recap: Win sealed with a triple-double",
    category_tr: "NBA",
    category_en: "NBA",
    time_tr: "1 saat önce",
    time_en: "1 hour ago",
    seed: "nba",
  },
  {
    title_tr: "Basketbol Süper Ligi'nde derbi öncesi sakatlık raporu",
    title_en: "Injury report ahead of the Super League derby",
    category_tr: "BSL",
    category_en: "BSL",
    time_tr: "2 saat önce",
    time_en: "2 hours ago",
    seed: "bsl",
  },
  {
    title_tr: "Genç yıldız sezonun en skorlu maçına imza attı",
    title_en: "Young star posts highest-scoring game of the season",
    category_tr: "Analiz",
    category_en: "Analysis",
    time_tr: "4 saat önce",
    time_en: "4 hours ago",
    seed: "analiz",
  },
];

function BasketballNewsMock() {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const isTr = lang === "tr";
  return (
    <div className="rl-section">
      <div className="card-head">
        <h3>{t.news}</h3>
      </div>
      {MOCK_BK_NEWS.map((n) => {
        const title = isTr ? n.title_tr : n.title_en;
        const category = isTr ? n.category_tr : n.category_en;
        const time = isTr ? n.time_tr : n.time_en;
        return (
          <div className="nl-item" key={n.seed}>
            <span className="nl-thumb" style={{ background: colorFromName(n.seed) }}>
              {category.charAt(0)}
            </span>
            <div className="nl-body">
              <div className="nl-title">{title}</div>
              <div className="nl-meta">
                {category} · {time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BasketballRightRail() {
  return (
    <>
      <BasketballFeaturedMatch />
      <BasketballNewsMock />
    </>
  );
}
