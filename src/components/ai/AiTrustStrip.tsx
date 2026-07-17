"use client";

import { useEffect, useState } from "react";
import type { AiPerformance } from "@/lib/ai-performance-types";
import { AI_MIN_SAMPLE } from "@/lib/ai-performance-types";

/**
 * Anasayfa ince güven şeridi: "AI analizlerimiz son 12 ayda %X isabetli".
 * AI Performans sayfasına götürür. Yeterli veri yoksa görünmez.
 */
export function AiTrustStrip({ lang }: { lang: "tr" | "en" }) {
  const [p, setP] = useState<AiPerformance | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/ai/performance")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: AiPerformance | null) => {
        if (alive) setP(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!p || p.year.total < AI_MIN_SAMPLE) return null;

  const href = lang === "tr" ? "/ai-performans" : "/ai-performance";
  const text =
    lang === "tr"
      ? `AI analizlerimiz son 12 ayda %${p.year.overallPct} isabetli`
      : `Our AI analysis is ${p.year.overallPct}% accurate over the last 12 months`;
  const cta = lang === "tr" ? "İsabet karnesini gör" : "See the accuracy report";

  return (
    <a
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 10,
        margin: "10px 0",
        padding: "10px 16px",
        borderRadius: 14,
        background: "linear-gradient(135deg, #052e16, #064e3b)",
        color: "#fff",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1,
          background: "rgba(74,222,128,0.2)",
          color: "#4ade80",
          padding: "2px 8px",
          borderRadius: 999,
        }}
      >
        AI
      </span>
      <span>{text}</span>
      <span style={{ color: "#4ade80", fontWeight: 800 }}>{cta} →</span>
    </a>
  );
}
