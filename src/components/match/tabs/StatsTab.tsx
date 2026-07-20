"use client";

import type { MatchDetailResponse } from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

/** "65%" → 65; "12" → 12; null → 0 */
function parseNum(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = parseFloat(v.toString().replace("%", ""));
  return isFinite(n) ? n : 0;
}

function displayValue(v: string | number | null | undefined): string {
  if (v == null) return "—";
  return String(v);
}

export function StatsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const stats = detail.statistics ?? [];

  if (stats.length === 0) {
    return (
      <div className="match-tab match-tab-stats">
        <section className="match-card">
          <p className="match-empty">
            {t("Maç istatistiği henüz yok", "No match statistics yet")}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="match-tab match-tab-stats">
      <section className="match-card">
        <header className="match-card-head">
          <h2>{t("Takım İstatistikleri", "Team Statistics")}</h2>
        </header>
        <ul className="stat-list">
          {stats.map((s, i) => {
            const homeN = parseNum(s.home);
            const awayN = parseNum(s.away);
            const total = homeN + awayN;
            const homePct = total > 0 ? (homeN / total) * 100 : 50;
            const awayPct = total > 0 ? (awayN / total) * 100 : 50;
            return (
              <li key={i} className="stat-row">
                <div className="stat-row-head">
                  <span className="stat-value-home tnum">{displayValue(s.home)}</span>
                  <span className="stat-type">{s.typeText ?? s.type}</span>
                  <span className="stat-value-away tnum">{displayValue(s.away)}</span>
                </div>
                <div className="stat-bars">
                  <div className="stat-bar stat-bar-home">
                    <span
                      className="stat-bar-fill"
                      style={{ width: `${homePct}%` }}
                    />
                  </div>
                  <div className="stat-bar stat-bar-away">
                    <span
                      className="stat-bar-fill"
                      style={{ width: `${awayPct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
