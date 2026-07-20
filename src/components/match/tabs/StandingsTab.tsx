"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { teamPath } from "@/lib/routes";
import type {
  MatchBracketView,
  MatchDetailResponse,
  MatchStandingRow,
  MatchStandingsGroup,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

// Bilinen UEFA / promosyon-relegation pattern'lari icin sabit renk.
// Mobile ile ayni: brand tanidikligi icin sabit, diger her sey dynamic palette.
function knownColor(desc: string): string | null {
  const d = desc.toLowerCase();
  // UEFA / Avrupa kupalari — sabit brand renkleri
  if (d.includes("champions league")) return "#16a34a"; // yesil
  if (d.includes("europa league")) return "#ea580c"; // turuncu
  if (d.includes("conference")) return "#7c3aed"; // mor
  // Lig sonu
  if (d.includes("relegation")) return "#dc2626"; // kirmizi (kume dusen)
  if (d.includes("promotion")) return "#0e7490"; // turkuaz (yukselen)
  // Knockout / eleme — Dunya Kupasi / kita kupalari
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
  ) {
    return "#2563eb"; // mavi — "tur atladi" / ust tura yukseliyor
  }
  // Olasi
  if (d.includes("possible")) return "#f59e0b"; // amber — olasi
  // Elenmis / yarida kalmis
  if (
    d.includes("eliminated") ||
    d.includes("knocked out") ||
    d.includes("not qualified")
  ) {
    return "#94a3b8"; // gri — elendi
  }
  return null;
}

// Bilinmeyen description'lar icin dontu palette — birbirine yakin olmayan,
// goz kaymayan renkler.
const DYNAMIC_PALETTE: string[] = [
  "#2563eb", // mavi
  "#ca8a04", // amber/sari
  "#db2777", // pembe
  "#65a30d", // lime
  "#a21caf", // magenta
  "#e11d48", // kirmizi-pembe
  "#4f46e5", // indigo
  "#0d9488", // turkuaz
  "#d97706", // turuncu-amber
];

// Tum gruplari tek tarama ile gez, unique description'lara renk ata.
// Deterministic sira: her grupta rank'a gore, gruplar arasinda alfabetik.
function buildDescColorMap(groups: MatchStandingsGroup[]): Map<string, string> {
  const map = new Map<string, string>();
  let paletteIdx = 0;
  for (const g of groups) {
    const sorted = [...g.rows].sort((a, b) => a.rank - b.rank);
    for (const r of sorted) {
      const d = (r.description ?? "").trim();
      if (!d) continue;
      if (map.has(d)) continue;
      const known = knownColor(d);
      if (known) {
        map.set(d, known);
      } else {
        // Daha once kullanilmis bir paletteIdx'i atla
        while (
          paletteIdx < DYNAMIC_PALETTE.length &&
          Array.from(map.values()).includes(DYNAMIC_PALETTE[paletteIdx])
        ) {
          paletteIdx++;
        }
        if (paletteIdx >= DYNAMIC_PALETTE.length) paletteIdx = 0;
        map.set(d, DYNAMIC_PALETTE[paletteIdx]);
        paletteIdx++;
      }
    }
  }
  return map;
}

// Legend item — descriptionText (lokal) varsa onu, yoksa raw description.
interface LegendItem {
  color: string;
  label: string;
}

function buildLegendItems(
  groups: MatchStandingsGroup[],
  descColors: Map<string, string>,
): LegendItem[] {
  const seen = new Map<string, LegendItem>();
  for (const g of groups) {
    const sorted = [...g.rows].sort((a, b) => a.rank - b.rank);
    for (const r of sorted) {
      const d = (r.description ?? "").trim();
      if (!d) continue;
      if (seen.has(d)) continue;
      const label =
        r.descriptionText && r.descriptionText.trim().length > 0
          ? r.descriptionText
          : d;
      seen.set(d, { color: descColors.get(d) ?? "#94a3b8", label });
    }
  }
  return Array.from(seen.values());
}

function groupSortKey(name: string): string {
  return (name ?? "").toLowerCase();
}

function formChar(l: string, lang: "tr" | "en"): string {
  if (lang !== "tr") return l;
  if (l === "W") return "G";
  if (l === "D") return "B";
  if (l === "L") return "M";
  return l;
}

function FormPills({ form, lang }: { form: string; lang: "tr" | "en" }) {
  const letters = form.slice(-5).split("");
  return (
    <span className="standings-form">
      {letters.map((l, i) => {
        const cls =
          l === "W" ? "is-w" : l === "L" ? "is-l" : l === "D" ? "is-d" : "is-n";
        return (
          <span key={i} className={`form-pill ${cls}`} title={l}>
            {formChar(l, lang)}
          </span>
        );
      })}
    </span>
  );
}

function StandingsTable({
  rows,
  highlightTeamIds,
  descColors,
  lang,
}: {
  rows: MatchStandingRow[];
  highlightTeamIds: Set<number>;
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
            <th title={t("Oynanan", "Played")}>O</th>
            <th title={t("Galibiyet", "Wins")}>G</th>
            <th title={t("Beraberlik", "Draws")}>B</th>
            <th title={t("Mağlubiyet", "Losses")}>M</th>
            <th title={t("Attığı", "Goals For")}>A</th>
            <th title={t("Yediği", "Goals Against")}>Y</th>
            <th title={t("Averaj", "Goal Diff")}>AV</th>
            <th title={t("Puan", "Points")}>P</th>
            <th className="standings-form-col">{t("Form", "Form")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const rawDesc = (r.description ?? "").trim();
            const accent = rawDesc ? descColors.get(rawDesc) ?? null : null;
            const isHighlighted = highlightTeamIds.has(r.teamId);
            return (
              <tr
                key={`${r.teamId}-${idx}`}
                className={`standings-row ${accent ? "has-zone" : ""} ${isHighlighted ? "is-highlight" : ""}`}
                style={accent ? { ["--zone-color" as string]: accent } : undefined}
              >
                <td className="standings-pos">
                  <span className="standings-pos-bar" />
                  {r.rank}
                </td>
                <td className="standings-team-col">
                  {r.teamSlug ? (
                    <Link
                      href={teamPath(lang, r.teamSlug)}
                      className="standings-team-link"
                    >
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

function ZoneLegend({ items }: { items: LegendItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="standings-legend">
      {items.map((it, i) => (
        <span key={i} className="standings-legend-item">
          <span
            className="standings-legend-swatch"
            style={{ background: it.color }}
          />
          <span>{it.label}</span>
        </span>
      ))}
    </div>
  );
}

function BracketViewBlock({ bracket }: { bracket: MatchBracketView }) {
  return (
    <div className="bracket-wrap">
      {bracket.rounds.map((rnd) => (
        <div key={rnd.name} className="bracket-round">
          <h4 className="bracket-round-label">{rnd.nameText ?? rnd.name}</h4>
          <div className="bracket-ties">
            {rnd.ties.map((tie) => {
              const winnerId = tie.winnerTeamId;
              const homeLegs = tie.legs
                .map((l) =>
                  l.homeScore != null && l.awayScore != null
                    ? l.homeTeamId === tie.home?.id
                      ? l.homeScore
                      : l.awayScore
                    : null,
                )
                .map((v) => (v == null ? "·" : String(v)))
                .join(" / ");
              const awayLegs = tie.legs
                .map((l) =>
                  l.homeScore != null && l.awayScore != null
                    ? l.homeTeamId === tie.away?.id
                      ? l.homeScore
                      : l.awayScore
                    : null,
                )
                .map((v) => (v == null ? "·" : String(v)))
                .join(" / ");
              return (
                <div key={tie.tieId} className="bracket-tie">
                  <div
                    className={`bracket-team ${
                      winnerId != null && winnerId === tie.home?.id ? "is-winner" : ""
                    }`}
                  >
                    {tie.home ? (
                      <>
                        <TeamLogo name={tie.home.name} logo={tie.home.logo ?? null} size={20} />
                        <span className="bracket-team-name">{tie.home.name}</span>
                      </>
                    ) : (
                      <span className="bracket-team-name bracket-team-tbd">—</span>
                    )}
                    <span className="bracket-legs tnum">{homeLegs}</span>
                  </div>
                  <div
                    className={`bracket-team ${
                      winnerId != null && winnerId === tie.away?.id ? "is-winner" : ""
                    }`}
                  >
                    {tie.away ? (
                      <>
                        <TeamLogo name={tie.away.name} logo={tie.away.logo ?? null} size={20} />
                        <span className="bracket-team-name">{tie.away.name}</span>
                      </>
                    ) : (
                      <span className="bracket-team-name bracket-team-tbd">—</span>
                    )}
                    <span className="bracket-legs tnum">{awayLegs}</span>
                  </div>
                  {tie.penaltyHome != null && tie.penaltyAway != null ? (
                    <div className="bracket-pens tnum">
                      Pen {tie.penaltyHome}-{tie.penaltyAway}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StandingsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const standings = useMemo<MatchStandingsGroup[]>(
    () =>
      [...(detail.standings ?? [])].sort((a, b) =>
        groupSortKey(a.groupName).localeCompare(groupSortKey(b.groupName)),
      ),
    [detail.standings],
  );
  const descColors = useMemo(() => buildDescColorMap(standings), [standings]);
  const legendItems = useMemo(
    () => buildLegendItems(standings, descColors),
    [standings, descColors],
  );
  const bracket = detail.bracket;
  const [activeGroup, setActiveGroup] = useState(0);

  const highlight = new Set<number>([detail.homeTeam.id, detail.awayTeam.id]);

  if (standings.length === 0) {
    if (bracket && bracket.rounds && bracket.rounds.length > 0) {
      return (
        <div className="match-tab match-tab-standings">
          <section className="match-card">
            <header className="match-card-head">
              <h2>{t("Eşleşmeler", "Bracket")}</h2>
            </header>
            <BracketViewBlock bracket={bracket} />
          </section>
        </div>
      );
    }
    return (
      <div className="match-tab match-tab-standings">
        <section className="match-card">
          <p className="match-empty">
            {t(
              "Bu lig için puan durumu yok",
              "No standings available for this competition",
            )}
          </p>
        </section>
      </div>
    );
  }

  const group = standings[activeGroup] ?? standings[0];

  return (
    <div className="match-tab match-tab-standings">
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
        <StandingsTable
          rows={group.rows}
          highlightTeamIds={highlight}
          descColors={descColors}
          lang={lang}
        />
        <ZoneLegend items={legendItems} />
      </section>

      {bracket && bracket.rounds && bracket.rounds.length > 0 ? (
        <section className="match-card">
          <header className="match-card-head">
            <h2>{t("Eşleşmeler", "Bracket")}</h2>
          </header>
          <BracketViewBlock bracket={bracket} />
        </section>
      ) : null}
    </div>
  );
}
