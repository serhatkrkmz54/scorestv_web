"use client";

import Link from "next/link";
import { playerPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import type {
  MatchDetailResponse,
  MatchTopPlayer,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

function PlayerCell({
  p,
  unit,
  side,
  lang,
}: {
  p?: MatchTopPlayer | null;
  unit: string;
  side: "home" | "away";
  lang: "tr" | "en";
}) {
  if (!p) {
    return <div className={`tp-cell tp-cell-${side} tp-cell-empty`}>—</div>;
  }
  const inner = (
    <>
      <span className="tp-avatar">
        {p.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo} alt="" />
        ) : (
          <span className="tp-avatar-fb">{p.name.charAt(0)}</span>
        )}
      </span>
      <span className="tp-info">
        <span className="tp-name">{p.name}</span>
        <span className="tp-value tnum">
          {p.value} {unit}
        </span>
      </span>
    </>
  );
  return (
    <Link
      href={playerPath(lang, buildEntitySlug(p.name, p.playerId))}
      className={`tp-cell tp-cell-${side}`}
    >
      {inner}
    </Link>
  );
}

function Section({
  label,
  unit,
  home,
  away,
  lang,
}: {
  label: string;
  unit: string;
  home?: MatchTopPlayer | null;
  away?: MatchTopPlayer | null;
  lang: "tr" | "en";
}) {
  return (
    <div className="tp-section">
      <div className="tp-label">{label}</div>
      <div className="tp-row">
        <PlayerCell p={home} unit={unit} side="home" lang={lang} />
        <PlayerCell p={away} unit={unit} side="away" lang={lang} />
      </div>
    </div>
  );
}

/**
 * Öne Çıkan Oyuncular — her iki takımın bu lig+sezondaki en golcü + en asist
 * oyuncusu. Oyuncuya tıklayınca oyuncu sayfasına gider. Veri yoksa gizli.
 */
export function TopPlayersCard({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const tp = detail.topPlayers;
  if (
    !tp ||
    (!tp.homeScorer && !tp.awayScorer && !tp.homeAssist && !tp.awayAssist)
  ) {
    return null;
  }
  return (
    <section className="match-card">
      <header className="match-card-head">
        <h3>{t("Öne Çıkan Oyuncular", "Key Players")}</h3>
      </header>
      <Section
        label={t("En Golcü", "Top Scorer")}
        unit={t("gol", "goals")}
        home={tp.homeScorer}
        away={tp.awayScorer}
        lang={lang}
      />
      <Section
        label={t("En Asist", "Top Assists")}
        unit={t("asist", "assists")}
        home={tp.homeAssist}
        away={tp.awayAssist}
        lang={lang}
      />
    </section>
  );
}
