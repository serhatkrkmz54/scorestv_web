"use client";

import { useEffect, useState } from "react";
import type {
  PredictionResult,
  PredictionChoice,
} from "@/lib/prediction-types";

/**
 * Maç sonucu tahmin oylaması kartı (1X2). Kickoff'tan önce oy verilir; maç
 * başlayınca kilitlenir, topluluk dağılımı gösterilir. Anonim (voterId BFF
 * cookie'sinde). Yüklenemezse sessizce gizlenir.
 */
export function PredictionCard({
  fixtureId,
  homeName,
  awayName,
  lang,
  resultChoice = null,
}: {
  fixtureId: number;
  homeName: string;
  awayName: string;
  lang: "tr" | "en";
  /** Maç bittiyse gerçek sonuç: "HOME" / "DRAW" / "AWAY". Null = maç bitmedi.
   *  Kazanan satırın yanına yeşil tik koymak için. */
  resultChoice?: PredictionChoice | null;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [data, setData] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const r = await fetch(`/api/predictions/fixtures/${fixtureId}`, {
          cache: "no-store",
        });
        const j = (await r.json()) as PredictionResult;
        if (active) setData(j);
      } catch {
        // yut
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fixtureId]);

  async function vote(choice: PredictionChoice) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/predictions/fixtures/${fixtureId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      const j = (await r.json()) as PredictionResult;
      setData(j);
      setEditing(false);
    } catch {
      // yut
    } finally {
      setBusy(false);
    }
  }

  if (loading || !data) return null;

  const showVote = data.votingOpen && (data.myChoice == null || editing);
  const pct = (n: number) =>
    data.total > 0 ? Math.round((n / data.total) * 100) : 0;

  const rows = [
    { k: "HOME" as const, label: homeName, n: data.home },
    { k: "DRAW" as const, label: t("Beraberlik", "Draw"), n: data.draw },
    { k: "AWAY" as const, label: awayName, n: data.away },
  ];

  return (
    <section className="match-card pred-card">
      <header className="match-card-head pred-head">
        <h2>{t("Maç Sonucu Tahmini", "Match Prediction")}</h2>
        {data.total > 0 && (
          <span className="pred-total">
            {data.total} {t("oy", "votes")}
          </span>
        )}
      </header>

      {showVote ? (
        <div className="pred-vote">
          <button
            className="pred-btn"
            onClick={() => vote("HOME")}
            disabled={busy}
          >
            <span className="pred-btn-team">{homeName}</span>
            <span className="pred-btn-hint">{t("kazanır", "win")}</span>
          </button>
          <button
            className="pred-btn pred-btn-draw"
            onClick={() => vote("DRAW")}
            disabled={busy}
          >
            <span className="pred-btn-team">{t("Beraberlik", "Draw")}</span>
            <span className="pred-btn-hint">X</span>
          </button>
          <button
            className="pred-btn"
            onClick={() => vote("AWAY")}
            disabled={busy}
          >
            <span className="pred-btn-team">{awayName}</span>
            <span className="pred-btn-hint">{t("kazanır", "win")}</span>
          </button>
        </div>
      ) : (
        <div className="pred-result">
          {rows.map((row) => {
            const p = pct(row.n);
            const mine = data.myChoice === row.k;
            const won = resultChoice === row.k;
            return (
              <div className={"pred-row" + (mine ? " mine" : "")} key={row.k}>
                <div className="pred-row-top">
                  <span className="pred-row-label">
                    {row.label}
                    {mine ? " ✓" : ""}
                    {won ? (
                      <span className="pred-row-win" aria-label={t("Kazandı", "Won")}>
                        ✓
                      </span>
                    ) : null}
                  </span>
                  <span className="pred-row-pct">%{p}</span>
                </div>
                <div className="pred-bar">
                  <span style={{ width: `${p}%` }} />
                </div>
              </div>
            );
          })}
          <div className="pred-foot">
            {data.votingOpen ? (
              <button className="pred-change" onClick={() => setEditing(true)}>
                {t("Tahminini değiştir", "Change your pick")}
              </button>
            ) : (
              <span className="pred-closed">
                {t("Oylama kapandı", "Voting closed")}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
