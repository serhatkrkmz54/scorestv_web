"use client";

import { TeamLogo } from "@/components/shell/TeamLogo";
import type {
  BasketballGameDetailResponse,
  BasketballTeamStatsView,
} from "@/lib/basketball-detail-types";

interface Props {
  detail: BasketballGameDetailResponse;
  lang: "tr" | "en";
}

export function BasketballStatsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const stats: BasketballTeamStatsView[] = detail.teamStats ?? [];

  if (stats.length < 2) {
    return (
      <div className="match-tab match-tab-stats">
        <section className="match-card">
          <p className="match-empty">
            {t("İstatistik henüz mevcut değil", "No statistics available yet")}
          </p>
        </section>
      </div>
    );
  }

  const home = stats.find((s) => s.team.id === detail.homeTeam.id) ?? stats[0];
  const away = stats.find((s) => s.team.id === detail.awayTeam.id) ?? stats[1];

  const ma = (v: { total: number | null; attempts: number | null } | null | undefined) =>
    v ? `${v.total ?? 0}/${v.attempts ?? 0}` : "-";

  const rows: { label: string; home: string; away: string }[] = [
    { label: t("Saha İçi", "Field Goals"), home: ma(home.fieldGoals), away: ma(away.fieldGoals) },
    { label: t("3 Sayı", "3-Point"), home: ma(home.threepoint), away: ma(away.threepoint) },
    { label: t("Serbest Atış", "Free Throws"), home: ma(home.freethrows), away: ma(away.freethrows) },
    { label: t("Ribaund", "Rebounds"), home: String(home.rebounds?.total ?? 0), away: String(away.rebounds?.total ?? 0) },
    { label: t("Asist", "Assists"), home: String(home.assists ?? 0), away: String(away.assists ?? 0) },
    { label: t("Top Çalma", "Steals"), home: String(home.steals ?? 0), away: String(away.steals ?? 0) },
    { label: t("Blok", "Blocks"), home: String(home.blocks ?? 0), away: String(away.blocks ?? 0) },
    { label: t("Top Kaybı", "Turnovers"), home: String(home.turnovers ?? 0), away: String(away.turnovers ?? 0) },
    { label: t("Faul", "Fouls"), home: String(home.personalFouls ?? 0), away: String(away.personalFouls ?? 0) },
  ];

  return (
    <div className="match-tab match-tab-stats">
      <section className="match-card">
        <header className="match-card-head sport-stats-head">
          <span className="sport-stats-team">
            <TeamLogo name={home.team.name} logo={home.team.logo ?? null} size={20} />
            {home.team.displayName ?? home.team.name}
          </span>
          <span className="sport-stats-team sport-stats-team-away">
            {away.team.displayName ?? away.team.name}
            <TeamLogo name={away.team.name} logo={away.team.logo ?? null} size={20} />
          </span>
        </header>
        <ul className="sport-stats-list">
          {rows.map((r, i) => (
            <li key={i} className="sport-stats-row">
              <span className="sport-stats-val tnum">{r.home}</span>
              <span className="sport-stats-label">{r.label}</span>
              <span className="sport-stats-val tnum">{r.away}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
