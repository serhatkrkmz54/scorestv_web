"use client";

import { TeamLogo } from "@/components/shell/TeamLogo";
import type { BasketballTeamDetailResponse } from "@/lib/basketball-team-types";

interface Props {
  detail: BasketballTeamDetailResponse;
  lang: "tr" | "en";
}

export function BasketballTeamSquadTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const roster = detail.roster ?? [];
  if (roster.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Kadro verisi yok", "No roster data")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab">
      <section className="match-card">
        <ul className="bk-roster-list">
          {roster.map((p) => (
            <li key={p.id} className="bk-roster-row">
              <span className="bk-roster-num tnum">
                {p.jerseyNumber != null ? p.jerseyNumber : "-"}
              </span>
              <span className="bk-roster-id">
                <TeamLogo name={p.displayName ?? p.name} logo={p.photo ?? null} size={28} />
                <span className="bk-roster-name">{p.displayName ?? p.name}</span>
              </span>
              <span className="bk-roster-pos">{p.position ?? ""}</span>
              <span className="bk-roster-meta">
                {p.heightCm ? `${p.heightCm} cm` : ""}
                {p.heightCm && p.nationality ? " · " : ""}
                {p.nationality ?? ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
