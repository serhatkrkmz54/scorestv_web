"use client";

import { useEffect, useState } from "react";
import type { AiPerformance } from "@/lib/ai-performance-types";
import { AI_MIN_SAMPLE } from "@/lib/ai-performance-types";

/**
 * Maç detayı AI Analiz kartına küçük güven rozeti: "Son 12 ayda AI isabetimiz
 * %X" → AI Performans sayfasına link. Yeterli veri yoksa hiç görünmez.
 */
export function AiAccuracyBadge({ lang }: { lang: "tr" | "en" }) {
  const [p, setP] = useState<AiPerformance | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/ai/performance")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: AiPerformance | null) => {
        if (alive) setP(d);
      })
      .catch(() => {
        /* sessizce gizle */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!p || p.year.total < AI_MIN_SAMPLE) return null;

  const href = lang === "tr" ? "/ai-performans" : "/ai-performance";
  const label =
    lang === "tr"
      ? `Son 12 ayda AI isabetimiz %${p.year.overallPct}`
      : `Our AI accuracy (last 12 mo): ${p.year.overallPct}%`;

  return (
    <a
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: "0 14px 10px",
        padding: "7px 12px",
        fontSize: 12.5,
        fontWeight: 700,
        color: "#047857",
        background: "rgba(16,185,129,0.12)",
        border: "1px solid rgba(16,185,129,0.25)",
        borderRadius: 10,
        textDecoration: "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#10b981",
          flex: "0 0 auto",
        }}
      />
      <span style={{ flex: 1 }}>{label}</span>
      <span aria-hidden="true">→</span>
    </a>
  );
}
