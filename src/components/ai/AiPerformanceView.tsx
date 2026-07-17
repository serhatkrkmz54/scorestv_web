import type { AiPerformance, AiStatBlock } from "@/lib/ai-performance-types";
import { AI_MIN_SAMPLE } from "@/lib/ai-performance-types";
import styles from "./AiPerformance.module.css";

type Lang = "tr" | "en";

const T = {
  tr: {
    kicker: "AI Analiz",
    title: "AI Tahmin İsabet Karnesi",
    sub: "İstatistiksel analizdir — bahis tavsiyesi değildir.",
    heroLabel: (n: number) => `Son 12 ayda ${n} maçta birleşik isabet`,
    result: "Maç Sonucu",
    ou: "Alt / Üst 2.5",
    btts: "Karşılıklı Gol",
    exact: "Tam Skor",
    combined: "Birleşik",
    ofN: (h: number, t: number) => `${h}/${t} isabet`,
    m30: "Son 30 gün",
    y1: "Son 12 ay",
    all: "Tüm zaman",
    category: "Kategori",
    monthly: "Aylık isabet (birleşik)",
    building:
      "İsabet istatistikleri birikiyor. Yeterli maç notlandığında burada görünecek.",
    footnote:
      "Tam skor doğası gereği en zor tahmindir; birleşik oran maç sonucu, alt/üst ve karşılıklı gol tahminlerini kapsar.",
  },
  en: {
    kicker: "AI Analysis",
    title: "AI Prediction Accuracy",
    sub: "Statistical analysis — not betting advice.",
    heroLabel: (n: number) => `Combined accuracy over ${n} matches (12 months)`,
    result: "Match Result",
    ou: "Over / Under 2.5",
    btts: "Both Teams to Score",
    exact: "Exact Score",
    combined: "Combined",
    ofN: (h: number, t: number) => `${h}/${t} correct`,
    m30: "Last 30 days",
    y1: "Last 12 months",
    all: "All time",
    category: "Category",
    monthly: "Monthly accuracy (combined)",
    building:
      "Accuracy stats are building up. They will appear here once enough matches are graded.",
    footnote:
      "Exact score is inherently the hardest to predict; the combined rate covers match result, over/under and both-teams-to-score.",
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

export function AiPerformanceView({
  data,
  lang,
}: {
  data: AiPerformance | null;
  lang: Lang;
}) {
  const t = T[lang];

  if (!data || data.all.total < AI_MIN_SAMPLE) {
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

  const y = data.year;
  const cats: { label: string; hits: number; total: number; pct: number; secondary?: boolean }[] =
    [
      { label: t.result, hits: y.resultHits, total: y.resultTotal, pct: y.resultPct },
      { label: t.ou, hits: y.ouHits, total: y.total, pct: y.ouPct },
      { label: t.btts, hits: y.bttsHits, total: y.total, pct: y.bttsPct },
      { label: t.exact, hits: y.exactHits, total: y.total, pct: y.exactPct, secondary: true },
    ];

  const rows: { label: string; pick: (b: AiStatBlock) => number }[] = [
    { label: t.combined, pick: (b) => b.overallPct },
    { label: t.result, pick: (b) => b.resultPct },
    { label: t.ou, pick: (b) => b.ouPct },
    { label: t.btts, pick: (b) => b.bttsPct },
    { label: t.exact, pick: (b) => b.exactPct },
  ];

  const maxMonth = Math.max(1, ...data.months.map((m) => m.overallPct));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.kicker}>{t.kicker}</span>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.sub}>{t.sub}</p>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroPct}>%{y.overallPct}</div>
        <div className={styles.heroLabel}>{t.heroLabel(y.total)}</div>
      </div>

      <div className={styles.grid}>
        {cats.map((c) => (
          <div
            key={c.label}
            className={`${styles.card} ${c.secondary ? styles.secondary : ""}`}
          >
            <div className={styles.cardTitle}>{c.label}</div>
            <div className={styles.cardPct}>%{c.pct}</div>
            <div className={styles.cardSub}>{t.ofN(c.hits, c.total)}</div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.category}</th>
              <th>{t.m30}</th>
              <th>{t.y1}</th>
              <th>{t.all}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td className={i === 0 ? styles.big : ""}>%{r.pick(data.month)}</td>
                <td className={i === 0 ? styles.big : ""}>%{r.pick(data.year)}</td>
                <td className={i === 0 ? styles.big : ""}>%{r.pick(data.all)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
