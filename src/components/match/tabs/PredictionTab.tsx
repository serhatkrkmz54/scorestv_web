"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { TopPlayersCard } from "@/components/match/TopPlayersCard";
import { AiInsightCard } from "@/components/match/AiInsightCard";
import { teamPath } from "@/lib/routes";
import type {
  MatchDetailResponse,
  MatchPredictionPair,
  MatchTeam,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

function parsePct(s: string | null | undefined): number {
  if (!s) return 0;
  const n = parseFloat(String(s).replace("%", ""));
  return isFinite(n) ? n : 0;
}

function compareRow(label: string, pair: MatchPredictionPair) {
  const home = pair.home ?? null;
  const away = pair.away ?? null;
  const hN = parsePct(home);
  const aN = parsePct(away);
  const total = hN + aN;
  const hP = total > 0 ? (hN / total) * 100 : 50;
  const aP = total > 0 ? (aN / total) * 100 : 50;
  return { label, home: home ?? "-", away: away ?? "-", hP, aP };
}

const LABELS_TR: Record<string, string> = {
  form: "Form", att: "Hücum", def: "Savunma",
  poisson: "Poisson", h2h: "H2H", goals: "Goller", total: "Toplam",
};
const LABELS_EN: Record<string, string> = {
  form: "Form", att: "Attack", def: "Defense",
  poisson: "Poisson", h2h: "H2H", goals: "Goals", total: "Total",
};

function TeamLegend({ team, pct, lang }: { team: MatchTeam; pct: string | null | undefined; lang: "tr" | "en" }) {
  const inner = (
    <>
      <TeamLogo name={team.name} logo={team.logo ?? null} size={16} />
      <span>{team.name}</span>
      <span className="tnum">{pct ?? "-"}</span>
    </>
  );
  if (team.slug) {
    return (
      <Link href={teamPath(lang, team.slug)} className="prediction-pct-legend-item">
        {inner}
      </Link>
    );
  }
  return <span className="prediction-pct-legend-item">{inner}</span>;
}

export function PredictionTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const p = detail.prediction;

  if (!p) {
    return (
      <div className="match-tab match-tab-prediction">
        <AiInsightCard
          fixtureId={detail.id}
          lang={lang}
          homeName={detail.homeTeam.name}
          awayName={detail.awayTeam.name}
        />
        <section className="match-card">
          <p className="match-empty">{t("Tahmin verisi yok", "No prediction available")}</p>
        </section>
      </div>
    );
  }

  const pctHome = parsePct(p.percent?.home);
  const pctDraw = parsePct(p.percent?.draw);
  const pctAway = parsePct(p.percent?.away);
  const pctTotal = pctHome + pctDraw + pctAway;
  const norm = (v: number) => (pctTotal > 0 ? (v / pctTotal) * 100 : 33.33);

  const labels = lang === "tr" ? LABELS_TR : LABELS_EN;
  const comparison = p.comparison ?? {};
  const rawEntries: Array<[string, MatchPredictionPair | null | undefined]> = [
    ["form", comparison.form], ["att", comparison.att], ["def", comparison.def],
    ["poisson", comparison.poisson], ["h2h", comparison.h2h],
    ["goals", comparison.goals], ["total", comparison.total],
  ];
  const compEntries: Array<[string, MatchPredictionPair]> = rawEntries.filter(
    (entry): entry is [string, MatchPredictionPair] => {
      const v = entry[1];
      return v != null && (v.home != null || v.away != null);
    },
  );

  return (
    <div className="match-tab match-tab-prediction">
      <AiInsightCard
        fixtureId={detail.id}
        lang={lang}
        homeName={detail.homeTeam.name}
        awayName={detail.awayTeam.name}
      />
      <TopPlayersCard detail={detail} lang={lang} />
      {pctTotal > 0 ? (
        <section className="match-card">
          <header className="match-card-head">
            <h3>{t("Sonuç İhtimali", "Outcome Probability")}</h3>
          </header>
          <div className="prediction-pct">
            <div className="prediction-pct-bar">
              <span className="prediction-pct-seg is-home" style={{ width: `${norm(pctHome)}%` }}>
                {pctHome > 12 ? p.percent?.home : ""}
              </span>
              <span className="prediction-pct-seg is-draw" style={{ width: `${norm(pctDraw)}%` }}>
                {pctDraw > 12 ? p.percent?.draw : ""}
              </span>
              <span className="prediction-pct-seg is-away" style={{ width: `${norm(pctAway)}%` }}>
                {pctAway > 12 ? p.percent?.away : ""}
              </span>
            </div>
            <div className="prediction-pct-legend">
              <TeamLegend team={detail.homeTeam} pct={p.percent?.home} lang={lang} />
              <span className="prediction-pct-legend-item">
                <span>{t("Beraberlik", "Draw")}</span>
                <span className="tnum">{p.percent?.draw ?? "-"}</span>
              </span>
              <TeamLegend team={detail.awayTeam} pct={p.percent?.away} lang={lang} />
            </div>
          </div>
        </section>
      ) : null}

      {p.underOver || (p.goals && (p.goals.home || p.goals.away)) ? (
        <section className="match-card">
          <header className="match-card-head">
            <h3>{t("Gol Tahmini", "Goal Prediction")}</h3>
          </header>
          <dl className="info-grid">
            {p.underOver ? (
              <div className="info-row">
                <dt>{t("Alt/Üst", "Under/Over")}</dt>
                <dd>{p.underOver}</dd>
              </div>
            ) : null}
            {p.goals && (p.goals.home || p.goals.away) ? (
              <div className="info-row">
                <dt>{t("Tahmini Skor", "Predicted Goals")}</dt>
                <dd className="tnum">{(p.goals.home ?? "-") + " - " + (p.goals.away ?? "-")}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {compEntries.length > 0 ? (
        <section className="match-card">
          <header className="match-card-head">
            <h3>{t("Takım Karşılaştırması", "Team Comparison")}</h3>
          </header>
          <ul className="stat-list">
            {compEntries.map(([key, v]) => {
              const row = compareRow(labels[key] ?? key, v);
              return (
                <li key={key} className="stat-row">
                  <div className="stat-row-head">
                    <span className="stat-value-home tnum">{row.home}</span>
                    <span className="stat-type">{row.label}</span>
                    <span className="stat-value-away tnum">{row.away}</span>
                  </div>
                  <div className="stat-bars">
                    <div className="stat-bar stat-bar-home">
                      <span className="stat-bar-fill" style={{ width: `${row.hP}%` }} />
                    </div>
                    <div className="stat-bar stat-bar-away">
                      <span className="stat-bar-fill" style={{ width: `${row.aP}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
