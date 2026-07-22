"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { teamPath } from "@/lib/routes";
import type {
  MatchStandingRow,
  MatchStandingsGroup,
} from "@/lib/match-detail-types";
import type { LeagueDetailResponse } from "@/lib/league-detail-types";

interface Props {
  detail: LeagueDetailResponse;
  lang: "tr" | "en";
}

function knownColor(desc: string): string | null {
  const d = desc.toLowerCase();
  if (d.includes("champions league")) return "#16a34a";
  if (d.includes("europa league")) return "#ea580c";
  if (d.includes("conference")) return "#7c3aed";
  if (d.includes("relegation")) return "#dc2626";
  if (d.includes("promotion")) return "#0e7490";
  if (
    d.includes("round of") ||
    d.includes("knockout") ||
    d.includes("advancing") ||
    d.includes("qualified for") ||
    d.includes("qualified to") ||
    d.startsWith("last 16") ||
    d.startsWith("last 32") ||
    d.includes("quarter-final") ||
    d.includes("semi-final") ||
    d === "final"
  ) return "#2563eb";
  if (d.includes("possible")) return "#f59e0b";
  if (d.includes("eliminated") || d.includes("knocked out") || d.includes("not qualified")) return "#94a3b8";
  return null;
}

const DYNAMIC_PALETTE = [
  "#2563eb", "#ca8a04", "#db2777", "#65a30d", "#a21caf",
  "#e11d48", "#4f46e5", "#0d9488", "#d97706",
];

// Hex rengi açar (pct>0) / koyultur (pct<0). pct ∈ [-1, 1].
function shade(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  if (pct >= 0) {
    r = Math.round(r + (255 - r) * pct);
    g = Math.round(g + (255 - g) * pct);
    b = Math.round(b + (255 - b) * pct);
  } else {
    const p = 1 + pct;
    r = Math.round(r * p);
    g = Math.round(g * p);
    b = Math.round(b * p);
  }
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function buildDescColorMap(groups: MatchStandingsGroup[]): Map<string, string> {
  const map = new Map<string, string>();
  const used = new Set<string>(); // atanmış TÜM renkler — çakışmayı önle
  let idx = 0;
  // Kullanılmamış ilk ZIT palet rengini döndür; palet biterse tonla türet.
  const nextDistinct = (): string => {
    for (let k = 0; k < DYNAMIC_PALETTE.length; k++) {
      const c = DYNAMIC_PALETTE[(idx + k) % DYNAMIC_PALETTE.length];
      if (!used.has(c)) {
        idx = idx + k + 1;
        return c;
      }
    }
    // Palet doldu (çok fazla bölge) → yine de farklı bir ton üret.
    const c = shade(DYNAMIC_PALETTE[idx % DYNAMIC_PALETTE.length], idx % 2 ? -0.3 : 0.3);
    idx++;
    return c;
  };
  for (const g of groups) {
    const sorted = [...g.rows].sort((a, b) => a.rank - b.rank);
    for (const r of sorted) {
      const d = (r.description ?? "").trim();
      if (!d || map.has(d)) continue;
      // Semantik renk (yeşil CL, kırmızı düşme, teal yükselme...) — AMA bu renk
      // zaten başka bir bölgeye atanmışsa ÇAKIŞMA olur; o zaman ZIT/farklı bir
      // palet rengi seç (farklı bölgeler zıt renk olsun). Böylece iki ayrı
      // "Promotion" bölgesi bile net ayrı renkte görünür.
      let color = knownColor(d);
      if (!color || used.has(color)) color = nextDistinct();
      used.add(color);
      map.set(d, color);
    }
  }
  return map;
}

interface LegendItem { color: string; label: string }

function buildLegend(groups: MatchStandingsGroup[], colors: Map<string, string>): LegendItem[] {
  const seen = new Map<string, LegendItem>();
  for (const g of groups) {
    for (const r of [...g.rows].sort((a, b) => a.rank - b.rank)) {
      const d = (r.description ?? "").trim();
      if (!d || seen.has(d)) continue;
      const label = r.descriptionText && r.descriptionText.trim() ? r.descriptionText : d;
      seen.set(d, { color: colors.get(d) ?? "#94a3b8", label });
    }
  }
  return Array.from(seen.values());
}

function formChar(l: string, lang: "tr" | "en"): string {
  if (lang !== "tr") return l;
  if (l === "W") return "G";
  if (l === "D") return "B";
  if (l === "L") return "M";
  return l;
}

function FormPills({ form, lang }: { form: string; lang: "tr" | "en" }) {
  return (
    <span className="standings-form">
      {form.slice(-5).split("").map((l, i) => {
        const cls = l === "W" ? "is-w" : l === "L" ? "is-l" : l === "D" ? "is-d" : "is-n";
        return <span key={i} className={`form-pill ${cls}`} title={l}>{formChar(l, lang)}</span>;
      })}
    </span>
  );
}

function StandingsTable({ rows, descColors, lang }: {
  rows: MatchStandingRow[];
  descColors: Map<string, string>;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return (
    <div className="standings-table-wrap">
      <table className="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th className="standings-team-col">{t("Takim", "Team")}</th>
            <th>O</th><th>G</th><th>B</th><th>M</th><th>A</th><th>Y</th><th>AV</th><th>P</th>
            <th className="standings-form-col">{t("Form", "Form")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const rawDesc = (r.description ?? "").trim();
            const accent = rawDesc ? descColors.get(rawDesc) ?? null : null;
            return (
              <tr
                key={`${r.teamId}-${idx}`}
                className={`standings-row ${accent ? "has-zone" : ""}`}
                style={accent ? { ["--zone-color" as string]: accent } : undefined}
              >
                <td className="standings-pos">
                  <span className="standings-pos-bar" />
                  {r.rank}
                </td>
                <td className="standings-team-col">
                  {r.teamSlug ? (
                    <Link href={teamPath(lang, r.teamSlug)} className="standings-team-link">
                      <TeamLogo name={r.teamName} logo={r.teamLogo ?? null} size={18} />
                      <span>{r.teamName}</span>
                    </Link>
                  ) : (
                    <span className="standings-team-link">
                      <TeamLogo name={r.teamName} logo={r.teamLogo ?? null} size={18} />
                      <span>{r.teamName}</span>
                    </span>
                  )}
                </td>
                <td className="tnum">{r.played}</td>
                <td className="tnum">{r.win}</td>
                <td className="tnum">{r.draw}</td>
                <td className="tnum">{r.lose}</td>
                <td className="tnum">{r.goalsFor}</td>
                <td className="tnum">{r.goalsAgainst}</td>
                <td className="tnum">{r.goalsDiff}</td>
                <td className="tnum standings-points">{r.points}</td>
                <td>{r.form ? <FormPills form={r.form} lang={lang} /> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LeagueStandingsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const standings = useMemo<MatchStandingsGroup[]>(
    () => [...(detail.standings ?? [])].sort((a, b) =>
      (a.groupName ?? "").toLowerCase().localeCompare((b.groupName ?? "").toLowerCase()),
    ),
    [detail.standings],
  );
  const descColors = useMemo(() => buildDescColorMap(standings), [standings]);
  const legend = useMemo(() => buildLegend(standings, descColors), [standings, descColors]);
  const [activeGroup, setActiveGroup] = useState(0);

  if (standings.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">
            {t("Bu sezon için puan durumu yok", "No standings for this season")}
          </p>
        </section>
      </div>
    );
  }

  const group = standings[activeGroup] ?? standings[0];
  return (
    <div className="match-tab">
      {standings.length > 1 ? (
        <div className="standings-group-tabs-wrap">
          <div className="standings-group-tabs">
            {standings.map((g, i) => (
              <button
                key={g.groupName + i}
                type="button"
                onClick={() => setActiveGroup(i)}
                className={`standings-group-tab ${i === activeGroup ? "is-active" : ""}`}
              >
                {g.groupNameText ?? g.groupName}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <section className="match-card">
        <StandingsTable rows={group.rows} descColors={descColors} lang={lang} />
        {legend.length > 0 ? (
          <div className="standings-legend">
            {legend.map((it, i) => (
              <span key={i} className="standings-legend-item">
                <span className="standings-legend-swatch" style={{ background: it.color }} />
                <span>{it.label}</span>
              </span>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
