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
import type { SportGameSummary } from "@/lib/sport-scores-types";
import { basketballMatchPath, volleyballMatchPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconStar } from "@/components/icons";
import type { Lang } from "@/i18n/auth-strings";

interface Period {
  label: string;
  home: number | null;
  away: number | null;
}

// Spora gore periyot dagilimi — basketbol Ç1-Ç4/UZT, voleybol S1-S5.
// Yalnizca veri olan periyotlar dondurulur.
function periods(game: SportGameSummary, lang: Lang): Period[] {
  const out: Period[] = [];
  if (game.sport === "basketball") {
    const h = game.score.home;
    const a = game.score.away;
    const defs: [string, number | null, number | null][] = [
      [lang === "tr" ? "Ç1" : "Q1", h.q1, a.q1],
      [lang === "tr" ? "Ç2" : "Q2", h.q2, a.q2],
      [lang === "tr" ? "Ç3" : "Q3", h.q3, a.q3],
      [lang === "tr" ? "Ç4" : "Q4", h.q4, a.q4],
      [lang === "tr" ? "UZT" : "OT", h.ot, a.ot],
    ];
    for (const [label, hv, av] of defs) {
      if (hv != null || av != null) out.push({ label, home: hv, away: av });
    }
  } else {
    const h = game.score.home;
    const a = game.score.away;
    const defs: [string, number | null, number | null][] = [
      ["S1", h.set1, a.set1],
      ["S2", h.set2, a.set2],
      ["S3", h.set3, a.set3],
      ["S4", h.set4, a.set4],
      ["S5", h.set5, a.set5],
    ];
    for (const [label, hv, av] of defs) {
      if (hv != null || av != null) out.push({ label, home: hv, away: av });
    }
  }
  return out;
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
  const statusKind = isLive ? "live" : isUpcoming ? "up" : "fin";

  const detailPath =
    game.sport === "basketball"
      ? basketballMatchPath(lang, game.slug)
      : volleyballMatchPath(lang, game.slug);
  const go = () => router.push(detailPath);

  const segs = isUpcoming ? [] : periods(game, lang);

  return (
    <div
      className={"bk-row" + (isLive ? " live" : "")}
      onClick={go}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") go();
      }}
    >
      <div className={`bk-status ${statusKind}`}>
        {isLive && <span className="live-dot pulse" />}
        <span className="tnum">{statusMain}</span>
      </div>

      <div className="bk-teams">
        <div className={"bk-team" + (homeLost ? " lost" : "")}>
          <TeamLogo name={game.home.name} logo={game.home.logo} size={22} />
          <span className="nm">{game.home.name}</span>
        </div>
        <div className={"bk-team" + (awayLost ? " lost" : "")}>
          <TeamLogo name={game.away.name} logo={game.away.logo} size={22} />
          <span className="nm">{game.away.name}</span>
        </div>
      </div>

      {isUpcoming ? (
        <div className="bk-vs">VS</div>
      ) : (
        <>
          {segs.length > 0 && (
            <div
              className="bk-grid"
              style={{ gridTemplateColumns: `repeat(${segs.length}, minmax(15px, 1fr))` }}
            >
              {segs.map((p, i) => (
                <span key={"h" + i} className="bk-q">{p.home ?? 0}</span>
              ))}
              {segs.map((p, i) => (
                <span key={"a" + i} className="bk-q">{p.away ?? 0}</span>
              ))}
            </div>
          )}
          <div className="bk-total">
            <b className={homeLost ? "lose" : ""}>{game.score.homeTotal ?? 0}</b>
            <b className={awayLost ? "lose" : ""}>{game.score.awayTotal ?? 0}</b>
          </div>
        </>
      )}

      <button
        className={"iconbtn fav bk-fav" + (fav ? " on" : "")}
        onClick={(e) => {
          e.stopPropagation();
          toggle(game.id);
        }}
        aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        <IconStar s={16} fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
