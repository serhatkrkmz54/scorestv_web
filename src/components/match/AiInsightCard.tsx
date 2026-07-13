"use client";

import { useEffect, useState } from "react";
import type { MatchInsight } from "@/lib/insight-types";

interface Props {
  fixtureId: number;
  lang: "tr" | "en";
}

/**
 * "AI Analiz" kartı — kendi modelimizin kalibre olasılıkları (1X2, Alt/Üst, KG,
 * beklenen skor/gol, güven, doğal-dil özet). İstatistiksel analiz, bahis
 * tavsiyesi DEĞİL. Veri yoksa/az ise kart hiç görünmez.
 */
export function AiInsightCard({ fixtureId, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [data, setData] = useState<MatchInsight | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/match-insight/m-${fixtureId}?lang=${lang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MatchInsight | null) => {
        if (alive) setData(d);
      })
      .catch(() => {
        /* sessizce gizle */
      });
    return () => {
      alive = false;
    };
  }, [fixtureId, lang]);

  if (!data || !data.available) return null;

  const h = data.homeWinPct ?? 0;
  const d = data.drawPct ?? 0;
  const a = data.awayWinPct ?? 0;
  const total = Math.max(1, h + d + a);

  return (
    <section className="match-card ai-insight">
      <header className="ai-insight-head">
        <span className="ai-insight-badge">{t("AI ANALİZ", "AI ANALYSIS")}</span>
        {data.confidence ? (
          <span className="ai-insight-conf">
            {t("Güven", "Confidence")}: {data.confidence}
          </span>
        ) : null}
      </header>

      <div className="ai-1x2-labels">
        <span className="is-home">{t("EV", "Home")} {h}%</span>
        <span className="is-draw">{t("BER", "Draw")} {d}%</span>
        <span className="is-away">{t("DEP", "Away")} {a}%</span>
      </div>
      <div className="ai-1x2-bar">
        <span className="is-home" style={{ width: `${(h / total) * 100}%` }} />
        <span className="is-draw" style={{ width: `${(d / total) * 100}%` }} />
        <span className="is-away" style={{ width: `${(a / total) * 100}%` }} />
      </div>

      {data.summary ? <p className="ai-insight-summary">{data.summary}</p> : null}

      <div className="ai-insight-chips">
        {data.expectedScore ? (
          <span className="ai-chip">
            <b>{t("Beklenen skor", "Expected score")}</b> {data.expectedScore}
          </span>
        ) : null}
        {data.expectedGoalsHome != null && data.expectedGoalsAway != null ? (
          <span className="ai-chip">
            <b>{t("Gol beklentisi", "Expected goals")}</b>{" "}
            {data.expectedGoalsHome.toFixed(1)} - {data.expectedGoalsAway.toFixed(1)}
          </span>
        ) : null}
        {data.over25Pct != null ? (
          <span className="ai-chip">
            <b>{t("2.5 Üst", "Over 2.5")}</b> {data.over25Pct}%
          </span>
        ) : null}
        {data.bttsYesPct != null ? (
          <span className="ai-chip">
            <b>{t("KG Var", "BTTS")}</b> {data.bttsYesPct}%
          </span>
        ) : null}
      </div>

      {data.note ? <p className="ai-insight-note">{data.note}</p> : null}
    </section>
  );
}
