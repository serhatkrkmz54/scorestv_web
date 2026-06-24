"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { teamPath } from "@/lib/routes";
import type {
  VolleyballGameDetailResponse,
  VolleyballStandingRow,
  VolleyballStandingsGroup,
} from "@/lib/volleyball-detail-types";

interface Props {
  detail: VolleyballGameDetailResponse;
  lang: "tr" | "en";
}

function formChar(l: string, lang: "tr" | "en"): string {
  if (lang !== "tr") return l;
  if (l === "W") return "G";
  if (l === "L") return "M";
  return l;
}

function FormPills({ form, lang }: { form: string; lang: "tr" | "en" }) {
  const letters = form.slice(-5).split("");
  return (
    <span className="standings-form">
      {letters.map((l, i) => {
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
  highlight,
  lang,
}: {
  rows: VolleyballStandingRow[];
  highlight: Set<number>;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return (
    <div className="standings-table-wrap">
      <table className="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th className="standings-team-col">{t("Takım", "Team")}</th>
            <th title={t("Oynanan", "Played")}>O</th>
            <th title={t("Galibiyet", "Wins")}>G</th>
            <th title={t("Mağlubiyet", "Losses")}>M</th>
            <th title={t("Alınan Set", "Sets For")}>AS</th>
            <th title={t("Verilen Set", "Sets Against")}>VS</th>
            <th title={t("Set Farkı", "Set Diff")}>SF</th>
            <th title={t("Puan", "Points")}>P</th>
            <th className="standings-form-col">{t("Form", "Form")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const isH = highlight.has(r.team.id);
            return (
              <tr
                key={`${r.team.id}-${idx}`}
                className={`standings-row ${isH ? "is-highlight" : ""}`}
              >
                <td className="standings-pos">
                  <span className="standings-pos-bar" />
                  {r.position}
                </td>
                <td className="standings-team-col">
                  {r.team.slug ? (
                    <Link href={teamPath(lang, r.team.slug)} className="standings-team-link">
                      <TeamLogo name={r.team.name} logo={r.team.logo ?? null} size={18} />
                      <span>{r.team.displayName ?? r.team.name}</span>
                    </Link>
                  ) : (
                    <span className="standings-team-link">
                      <TeamLogo name={r.team.name} logo={r.team.logo ?? null} size={18} />
                      <span>{r.team.displayName ?? r.team.name}</span>
                    </span>
                  )}
                </td>
                <td className="tnum">{r.gamesPlayed ?? 0}</td>
                <td className="tnum">{r.won ?? 0}</td>
                <td className="tnum">{r.lost ?? 0}</td>
                <td className="tnum">{r.setsFor ?? 0}</td>
                <td className="tnum">{r.setsAgainst ?? 0}</td>
                <td className="tnum">{r.setsDifference ?? 0}</td>
                <td className="tnum standings-points">{r.points ?? 0}</td>
                <td>{r.form ? <FormPills form={r.form} lang={lang} /> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function VolleyballStandingsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const groups: VolleyballStandingsGroup[] = detail.standings ?? [];
  const [active, setActive] = useState(0);
  const highlight = new Set<number>([detail.homeTeam.id, detail.awayTeam.id]);

  if (groups.length === 0) {
    return (
      <div className="match-tab match-tab-standings">
        <section className="match-card">
          <p className="match-empty">
            {t("Bu lig için puan durumu yok", "No standings available")}
          </p>
        </section>
      </div>
    );
  }

  const group = groups[active] ?? groups[0];

  return (
    <div className="match-tab match-tab-standings">
      {groups.length > 1 ? (
        <div className="standings-group-tabs-wrap">
          <div className="standings-group-tabs">
            {groups.map((g, i) => (
              <button
                key={(g.groupName ?? "") + i}
                type="button"
                onClick={() => setActive(i)}
                className={`standings-group-tab ${i === active ? "is-active" : ""}`}
              >
                {g.groupName ?? g.stage ?? `Grup ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <section className="match-card">
        <StandingsTable rows={group.rows} highlight={highlight} lang={lang} />
      </section>
    </div>
  );
}
