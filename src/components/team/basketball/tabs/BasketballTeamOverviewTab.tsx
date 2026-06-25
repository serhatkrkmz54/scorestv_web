"use client";

import type { BasketballTeamDetailResponse } from "@/lib/basketball-team-types";
import { BasketballTeamFixtureRow } from "../BasketballTeamFixtureRow";

interface Props {
  detail: BasketballTeamDetailResponse;
  lang: "tr" | "en";
}

function fmt(v: number | string | null | undefined): string {
  if (v == null) return "-";
  return String(v);
}

export function BasketballTeamOverviewTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const ov = detail.overview;
  const ss = ov?.seasonSummary;
  return (
    <div className="match-tab">
      {ov?.lastGame || ov?.nextGame ? (
        <section className="match-card">
          {ov?.nextGame ? (
            <>
              <div className="match-card-title">{t("Sonraki Maç", "Next Game")}</div>
              <BasketballTeamFixtureRow g={ov.nextGame} lang={lang} />
            </>
          ) : null}
          {ov?.lastGame ? (
            <>
              <div className="match-card-title">{t("Son Maç", "Last Game")}</div>
              <BasketballTeamFixtureRow g={ov.lastGame} lang={lang} />
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
              <span className="bk-stat-val">{fmt(ss.pointsForAvg)}</span>
              <span className="bk-stat-lbl">{t("Sayı (Ort.)", "PF Avg")}</span>
            </div>
            <div className="bk-stat-item">
              <span className="bk-stat-val">{fmt(ss.pointsAgainstAvg)}</span>
              <span className="bk-stat-lbl">{t("Yenilen (Ort.)", "PA Avg")}</span>
            </div>
          </div>
        </section>
      ) : null}

      {!ov?.lastGame && !ov?.nextGame && !ss ? (
        <section className="match-card">
          <p className="match-empty">{t("Özet verisi yok", "No overview data")}</p>
        </section>
      ) : null}
    </div>
  );
}
