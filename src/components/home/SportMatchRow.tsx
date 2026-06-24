"use client";

import { useRouter } from "next/navigation";
import { useFavorites } from "@/context/favorites-context";
import { useLang } from "@/context/lang-context";
import {
  categorizeSport,
  sportStatusLabelShort,
  startTime,
  sportWinnerSide,
} from "@/lib/sport-scores";
import type { SportGameSummary, SportTeam } from "@/lib/sport-scores-types";
import { basketballMatchPath, volleyballMatchPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconStar } from "@/components/icons";
import type { Lang } from "@/i18n/auth-strings";

// Takim adi + logosu — basketbol/voleybolda takim detay rotasi henuz yok,
// bu yuzden sade div (futboldaki gibi Link DEGIL).
function TeamCell({
  team,
  side,
  lost,
}: {
  team: SportTeam;
  side: "home" | "away";
  lost: boolean;
}) {
  const cls = `mr-team ${side}` + (lost ? " lost" : "");
  const name = <span className="nm">{team.name}</span>;
  const logo = <TeamLogo name={team.name} logo={team.logo} size={26} />;
  const inner =
    side === "home" ? (
      <>
        {name}
        {logo}
      </>
    ) : (
      <>
        {logo}
        {name}
      </>
    );
  return <div className={cls}>{inner}</div>;
}

// Periyot/set dagilimi (Ç1-Ç4/UZT veya S1-S5) — skorun altinda kucuk.
function ScoreStrip({ game, lang }: { game: SportGameSummary; lang: Lang }) {
  const segs: string[] = [];
  if (game.sport === "basketball") {
    const h = game.score.home;
    const a = game.score.away;
    const labels = lang === "tr" ? ["Ç1", "Ç2", "Ç3", "Ç4", "UZT"] : ["Q1", "Q2", "Q3", "Q4", "OT"];
    const hv = [h.q1, h.q2, h.q3, h.q4, h.ot];
    const av = [a.q1, a.q2, a.q3, a.q4, a.ot];
    for (let i = 0; i < labels.length; i++) {
      if (hv[i] != null || av[i] != null) {
        segs.push(`${labels[i]} ${hv[i] ?? 0}-${av[i] ?? 0}`);
      }
    }
  } else {
    const h = game.score.home;
    const a = game.score.away;
    const labels = ["S1", "S2", "S3", "S4", "S5"];
    const hv = [h.set1, h.set2, h.set3, h.set4, h.set5];
    const av = [a.set1, a.set2, a.set3, a.set4, a.set5];
    for (let i = 0; i < labels.length; i++) {
      if (hv[i] != null || av[i] != null) {
        segs.push(`${labels[i]} ${hv[i] ?? 0}-${av[i] ?? 0}`);
      }
    }
  }
  if (segs.length === 0) return null;
  return <span className="sc-ht tnum sport-strip">{segs.join(" · ")}</span>;
}

export function SportMatchRow({ game }: { game: SportGameSummary }) {
  const router = useRouter();
  const { lang } = useLang();
  const { has, toggle } = useFavorites();

  const cat = categorizeSport(game.sport, game.status);
  const isLive = cat === "live";
  const isUpcoming = cat === "upcoming";
  const winner = isUpcoming ? null : sportWinnerSide(game);
  const fav = has(game.id);

  const homeLost = winner === "away";
  const awayLost = winner === "home";

  const statusMain = isUpcoming
    ? startTime(game.startAt)
    : sportStatusLabelShort(game.sport, game.status, lang);

  const detailPath =
    game.sport === "basketball"
      ? basketballMatchPath(lang, game.slug)
      : volleyballMatchPath(lang, game.slug);
  const go = () => router.push(detailPath);

  const statusKind = isLive ? "live" : isUpcoming ? "up" : "fin";

  return (
    <div
      className={"mrow" + (isLive ? " live" : "")}
      onClick={go}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") go();
      }}
    >
      <div className="mrow-line">
        <div className={`mr-status ${statusKind}`}>
          <span className="st-main">
            {isLive && <span className="live-dot pulse" />}
            <span className="tnum st-full">{statusMain}</span>
            <span className="tnum st-compact">{statusMain}</span>
          </span>
        </div>

        <TeamCell team={game.home} side="home" lost={homeLost} />

        {isUpcoming ? (
          <span className="mr-vs">VS</span>
        ) : (
          <div className="mr-score">
            <div className="sc-main tnum">
              <b className={homeLost ? "lose" : ""}>{game.score.homeTotal ?? 0}</b>
              <i>:</i>
              <b className={awayLost ? "lose" : ""}>{game.score.awayTotal ?? 0}</b>
            </div>
            <ScoreStrip game={game} lang={lang} />
          </div>
        )}

        <TeamCell team={game.away} side="away" lost={awayLost} />

        <div className="mr-end">
          <button
            className={"iconbtn fav" + (fav ? " on" : "")}
            onClick={(e) => {
              e.stopPropagation();
              toggle(game.id);
            }}
            aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <IconStar s={17} fill={fav ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}
