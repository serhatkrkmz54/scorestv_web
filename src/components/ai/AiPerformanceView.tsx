"use client";

import { useEffect, useMemo, useState } from "react";
import type { AiPerformance, AiStatBlock } from "@/lib/ai-performance-types";
import { AI_MIN_SAMPLE } from "@/lib/ai-performance-types";
import styles from "./AiPerformance.module.css";

type Lang = "tr" | "en";

const T = {
  tr: {
    kicker: "AI Analiz",
    title: "AI Tahmin İsabet Karnesi",
    sub: "İstatistiksel analizdir — bahis tavsiyesi değildir.",
    heroLabel: (n: number) => `${n} maçta birleşik isabet`,
    result: "Maç Sonucu",
    ou: "Alt / Üst 2.5",
    btts: "Karşılıklı Gol",
    exact: "Tam Skor",
    combined: "Birleşik",
    ofN: (h: number, t: number) => `${h}/${t} isabet`,
    monthly: "Aylık isabet (birleşik)",
    building:
      "İsabet istatistikleri birikiyor. Yeterli maç notlandığında burada görünecek.",
    footnote:
      "Tam skor doğası gereği en zor tahmindir; birleşik oran maç sonucu, alt/üst ve karşılıklı golü kapsar.",
    p_month: "Aylık",
    p_quarter: "3 Aylık",
    p_year: "Yıllık",
    p_all: "Tüm Zaman",
  },
  en: {
    kicker: "AI Analysis",
    title: "AI Prediction Accuracy",
    sub: "Statistical analysis — not betting advice.",
    heroLabel: (n: number) => `Combined accuracy over ${n} matches`,
    result: "Match Result",
    ou: "Over / Under 2.5",
    btts: "Both Teams Score",
    exact: "Exact Score",
    combined: "Combined",
    ofN: (h: number, t: number) => `${h}/${t} correct`,
    monthly: "Monthly accuracy (combined)",
    building:
      "Accuracy stats are building up. They will appear once enough matches are graded.",
    footnote:
      "Exact score is the hardest to predict; the combined rate covers match result, over/under and both-teams-to-score.",
    p_month: "Monthly",
    p_quarter: "3 Months",
    p_year: "Yearly",
    p_all: "All Time",
  },
};

function monthName(ym: string, lang: Lang): string {
  const [y, m] = ym.split("-").map((x) => parseInt(x, 10));
  const d = new Date(Date.UTC(y, (m || 1) - 1, 1));
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    year: "2-digit",
  });
}

/** SVG donut (pasta) — isabet arkı sayfaya girince animasyonla dolar. Metin
 * tam ortalanır (dominant-baseline central). İz rengi tema uyumlu. */
function Donut({
  pct,
  color,
  title,
  sub,
}: {
  pct: number;
  color: string;
  title: string;
  sub: string;
}) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * c;
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={styles.donut}>
      <div className={styles.donutTitle}>{title}</div>
      <svg viewBox="0 0 120 120" width={116} height={116}>
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="12"
          style={{ stroke: "var(--surface-3)" }}
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={on ? c - dash : c}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 950ms cubic-bezier(.2,.8,.2,1)" }}
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 24, fontWeight: 800, fill: color }}
        >
          %{pct}
        </text>
      </svg>
      <div className={styles.donutSub}>{sub}</div>
    </div>
  );
}

export function AiPerformanceView({
  data,
  lang,
}: {
  data: AiPerformance | null;
  lang: Lang;
}) {
  const t = T[lang];

  // Veriye göre uyarlanır dönem listesi: kısa pencereler yalnız EK veri
  // getiriyorsa gösterilir (ör. sadece 45 günlük veri varsa "Yıllık" gizli).
  const periods = useMemo(() => {
    if (!data) return [];
    const all = data.all;
    const out: { key: string; label: string; block: AiStatBlock }[] = [];
    const seen = new Set<number>();
    const shorts: { key: string; label: string; block: AiStatBlock }[] = [
      { key: "month", label: t.p_month, block: data.month },
      { key: "quarter", label: t.p_quarter, block: data.quarter },
      { key: "year", label: t.p_year, block: data.year },
    ];
    for (const p of shorts) {
      // p.block eski backend'de (quarter yokken) undefined olabilir → koru.
      if (
        p.block &&
        p.block.total > 0 &&
        p.block.total < all.total &&
        !seen.has(p.block.total)
      ) {
        seen.add(p.block.total);
        out.push(p);
      }
    }
    if (all.total > 0) out.push({ key: "all", label: t.p_all, block: all });
    return out;
  }, [data, t]);

  const [sel, setSel] = useState<string>("");
  const active =
    periods.find((p) => p.key === sel) ?? periods[periods.length - 1];

  if (!data || data.all.total < AI_MIN_SAMPLE || !active) {
    return (
      <div className={styles.wrap}>
        <div className={styles.head}>
          <span className={styles.kicker}>{t.kicker}</span>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.sub}>{t.sub}</p>
        </div>
        <p className={styles.empty}>{t.building}</p>
      </div>
    );
  }

  const b = active.block;
  const maxMonth = Math.max(1, ...data.months.map((m) => m.overallPct));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.kicker}>{t.kicker}</span>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.sub}>{t.sub}</p>
      </div>

      {/* Dönem seçici (uyarlanır) */}
      {periods.length > 1 && (
        <div className={styles.chips}>
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setSel(p.key)}
              className={`${styles.chip} ${p.key === active.key ? styles.chipActive : ""}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Öne çıkan birleşik isabet (seçili dönem) */}
      <div className={styles.hero}>
        <div className={styles.heroPct}>%{b.overallPct}</div>
        <div className={styles.heroLabel}>
          {active.label} · {t.heroLabel(b.total)}
        </div>
      </div>

      {/* Kategori donut'ları (pasta grafik) — dönem değişince yeniden animasyon */}
      <div key={active.key} className={styles.donuts}>
        <Donut
          pct={b.resultPct}
          color="#2563eb"
          title={t.result}
          sub={t.ofN(b.resultHits, b.resultTotal)}
        />
        <Donut
          pct={b.ouPct}
          color="#16a34a"
          title={t.ou}
          sub={t.ofN(b.ouHits, b.total)}
        />
        <Donut
          pct={b.bttsPct}
          color="#d97706"
          title={t.btts}
          sub={t.ofN(b.bttsHits, b.total)}
        />
        <Donut
          pct={b.exactPct}
          color="#7c3aed"
          title={t.exact}
          sub={t.ofN(b.exactHits, b.total)}
        />
      </div>

      {/* Aylık kırılım */}
      {data.months.length > 0 && (
        <div className={styles.months}>
          <div className={styles.monthsTitle}>{t.monthly}</div>
          {data.months.map((m) => (
            <div key={m.ym} className={styles.bar}>
              <span className={styles.barLabel}>{monthName(m.ym, lang)}</span>
              <span className={styles.barTrack}>
                <span
                  className={styles.barFill}
                  style={{ width: `${Math.max(6, (m.overallPct / maxMonth) * 100)}%` }}
                >
                  %{m.overallPct}
                </span>
              </span>
              <span className={styles.barCount}>{m.total}</span>
            </div>
          ))}
        </div>
      )}

      <p className={styles.note}>{t.footnote}</p>
    </div>
  );
}
