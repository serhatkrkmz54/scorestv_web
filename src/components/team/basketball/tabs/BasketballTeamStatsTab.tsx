"use client";

import type {
  BasketballTeamDetailResponse,
  BkHomeAwayBlock,
} from "@/lib/basketball-team-types";

interface Props {
  detail: BasketballTeamDetailResponse;
  lang: "tr" | "en";
}

function fmt(v: number | string | null | undefined): string {
  if (v == null) return "-";
  return String(v);
}

function HomeAway({
  block,
  title,
  lang,
}: {
  block: BkHomeAwayBlock | null;
  title: string;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  if (!block) return null;
  return (
    <section className="match-card">
      <div className="match-card-title">{title}</div>
      <div className="bk-stat-grid">
        <div className="bk-stat-item">
          <span className="bk-stat-val">{fmt(block.played)}</span>
          <span className="bk-stat-lbl">{t("Maç", "Played")}</span>
        </div>
        <div className="bk-stat-item">
          <span className="bk-stat-val">{fmt(block.wins)}</span>
          <span className="bk-stat-lbl">{t("Galibiyet", "Wins")}</span>
        </div>
        <div className="bk-stat-item">
          <span className="bk-stat-val">{fmt(block.loses)}</span>
          <span className="bk-stat-lbl">{t("Mağlubiyet", "Loses")}</span>
        </div>
        <div className="bk-stat-item">
          <span className="bk-stat-val">{fmt(block.pointsForAvg)}</span>
          <span className="bk-stat-lbl">{t("Sayı (Ort.)", "PF Avg")}</span>
        </div>
        <div className="bk-stat-item">
          <span className="bk-stat-val">{fmt(block.pointsAgainstAvg)}</span>
          <span className="bk-stat-lbl">{t("Yenilen (Ort.)", "PA Avg")}</span>
        </div>
      </div>
    </section>
  );
}

export function BasketballTeamStatsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const s = detail.statistics;
  if (!s) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("İstatistik verisi yok", "No statistics data")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab">
      <section className="match-card">
        <div className="match-card-title">{t("Sezon İstatistikleri", "Season Statistics")}</div>
        <div className="bk-stat-grid">
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.gamesPlayed)}</span>
            <span className="bk-stat-lbl">{t("Maç", "Played")}</span>
          </div>
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.wins)}</span>
            <span className="bk-stat-lbl">{t("Galibiyet", "Wins")}</span>
          </div>
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.loses)}</span>
            <span className="bk-stat-lbl">{t("Mağlubiyet", "Loses")}</span>
          </div>
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.winPercentage)}</span>
            <span className="bk-stat-lbl">{t("Kazanma %", "Win %")}</span>
          </div>
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.pointsForAvg)}</span>
            <span className="bk-stat-lbl">{t("Sayı (Ort.)", "PF Avg")}</span>
          </div>
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.pointsAgainstAvg)}</span>
            <span className="bk-stat-lbl">{t("Yenilen (Ort.)", "PA Avg")}</span>
          </div>
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.pointsDiffAvg)}</span>
            <span className="bk-stat-lbl">{t("Averaj (Ort.)", "Diff Avg")}</span>
          </div>
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.longestWinStreak)}</span>
            <span className="bk-stat-lbl">{t("En Uzun Galibiyet", "Win Streak")}</span>
          </div>
          <div className="bk-stat-item">
            <span className="bk-stat-val">{fmt(s.longestLoseStreak)}</span>
            <span className="bk-stat-lbl">{t("En Uzun Mağlubiyet", "Lose Streak")}</span>
          </div>
        </div>
      </section>
      <HomeAway block={s.homeBreakdown} title={t("Ev Sahibi", "Home")} lang={lang} />
      <HomeAway block={s.awayBreakdown} title={t("Deplasman", "Away")} lang={lang} />
    </div>
  );
}
