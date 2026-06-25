"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { basketballTeamPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import type {
  BasketballLeagueDetailResponse,
  BkStandingRow,
  BkStandingsGroup,
} from "@/lib/basketball-league-types";

interface Props {
  detail: BasketballLeagueDetailResponse;
  lang: "tr" | "en";
}

function formChar(l: string, lang: "tr" | "en"): string {
  if (lang !== "tr") return l;
  if (l === "W") return "G";
  if (l === "L") return "M";
  return l;
}

function FormPills({ form, lang }: { form: string; lang: "tr" | "en" }) {
  return (
    <span className="standings-form">
      {form.slice(-5).split("").map((l, i) => {
        const cls = l === "W" ? "is-w" : l === "L" ? "is-l" : "is-n";
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
  lang,
}: {
  rows: BkStandingRow[];
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
            <th>O</th>
            <th>{t("G", "W")}</th>
            <th>{t("M", "L")}</th>
            <th>%</th>
            <th>{t("SA", "PF")}</th>
            <th>{t("SY", "PA")}</th>
            <th>{t("AV", "DIFF")}</th>
            <th className="standings-form-col">{t("Form", "Form")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const slug =
              r.team.slug ?? buildEntitySlug(r.team.name, r.team.id);
            return (
              <tr key={`${r.team.id}-${idx}`} className="standings-row">
                <td className="standings-pos">
                  <span className="standings-pos-bar" />
                  {r.position ?? idx + 1}
                </td>
                <td className="standings-team-col">
                  <Link
                    href={basketballTeamPath(lang, slug)}
                    className="standings-team-link"
                  >
                    <TeamLogo name={r.team.name} logo={r.team.logo ?? null} size={18} />
                    <span>{r.team.name}</span>
                  </Link>
                </td>
                <td className="tnum">{r.gamesPlayed ?? "-"}</td>
                <td className="tnum">{r.won ?? "-"}</td>
                <td className="tnum">{r.lost ?? "-"}</td>
                <td className="tnum">{r.winPercentage ?? "-"}</td>
                <td className="tnum">{r.pointsFor ?? "-"}</td>
                <td className="tnum">{r.pointsAgainst ?? "-"}</td>
                <td className="tnum">{r.pointsDifference ?? "-"}</td>
                <td>{r.form ? <FormPills form={r.form} lang={lang} /> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function BasketballLeagueStandingsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const standings = useMemo<BkStandingsGroup[]>(
    () => detail.standings ?? [],
    [detail.standings],
  );
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
  const groupLabel = (g: BkStandingsGroup) =>
    g.groupName || g.stage || t("Puan Durumu", "Standings");
  return (
    <div className="match-tab">
      {standings.length > 1 ? (
        <div className="standings-group-tabs-wrap">
          <div className="standings-group-tabs">
            {standings.map((g, i) => (
              <button
                key={(g.groupName ?? "") + (g.stage ?? "") + i}
                type="button"
                onClick={() => setActiveGroup(i)}
                className={`standings-group-tab ${i === activeGroup ? "is-active" : ""}`}
              >
                {groupLabel(g)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <section className="match-card">
        <StandingsTable rows={group.rows} lang={lang} />
      </section>
    </div>
  );
}
