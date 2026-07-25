"use client";

import type { VolleyballTeamDetailResponse } from "@/lib/volleyball-team-types";
import { VolleyballTeamFixtureRow } from "../VolleyballTeamFixtureRow";

interface Props {
  detail: VolleyballTeamDetailResponse;
  lang: "tr" | "en";
}

function fmt(v: number | string | null | undefined): string {
  if (v == null) return "-";
  return String(v);
}

// Genel bakis: sonraki/son mac + sezon ozeti + takimin lig siralamasi.
export function VolleyballTeamOverviewTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const ss = detail.seasonStats;
  const nextGame = detail.upcomingGames[0] ?? null;
  const lastGame = detail.recentGames[0] ?? null;
  const standing = detail.standings[0] ?? null;

  return (
    <div className="match-tab">
      {nextGame || lastGame ? (
        <section className="match-card">
          {nextGame ? (
            <>
              <div className="match-card-title">{t("Sonraki Maç", "Next Game")}</div>
              <VolleyballTeamFixtureRow g={nextGame} lang={lang} />
            </>
          ) : null}
          {lastGame ? (
            <>
              <div className="match-card-title">{t("Son Maç", "Last Game")}</div>
              <VolleyballTeamFixtureRow g={lastGame} lang={lang} />
            </>
          ) : null}
        </section>
      ) : null}

      {ss ? (
        <section className="match-card">
          <div className="match-card-title">{t("Sezon Özeti", "Season Summary")}</div>
          <div className="bk-stat-grid">
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(ss.wins)}</span>
              <span className="bk-stat-lbl">{t("Galibiyet", "Wins")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(ss.loses)}</span>
              <span className="bk-stat-lbl">{t("Mağlubiyet", "Loses")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(ss.winPercentage)}</span>
              <span className="bk-stat-lbl">{t("Kazanma %", "Win %")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(ss.setsForAvg)}</span>
              <span className="bk-stat-lbl">{t("Set (Ort.)", "Sets For Avg")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(ss.setsAgainstAvg)}</span>
              <span className="bk-stat-lbl">{t("Yenilen Set (Ort.)", "Sets Against Avg")}</span>
            </div>
          </div>
        </section>
      ) : null}

      {standing ? (
        <section className="match-card">
          <div className="match-card-title">{t("Lig Sıralaması", "League Standing")}</div>
          <div className="bk-stat-grid">
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(standing.position)}</span>
              <span className="bk-stat-lbl">{t("Sıra", "Position")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(standing.points)}</span>
              <span className="bk-stat-lbl">{t("Puan", "Points")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(standing.won)}</span>
              <span className="bk-stat-lbl">{t("G", "W")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(standing.lost)}</span>
              <span className="bk-stat-lbl">{t("M", "L")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">
                {standing.setsFor != null && standing.setsAgainst != null
                  ? `${standing.setsFor}/${standing.setsAgainst}`
                  : "-"}
              </span>
              <span className="bk-stat-lbl">{t("Set A/Y", "Sets F/A")}</span>
            </div>
          </div>
        </section>
      ) : null}

      {!nextGame && !lastGame && !ss && !standing ? (
        <section className="match-card">
          <p className="match-empty">{t("Özet verisi yok", "No overview data")}</p>
        </section>
      ) : null}
    </div>
  );
}
