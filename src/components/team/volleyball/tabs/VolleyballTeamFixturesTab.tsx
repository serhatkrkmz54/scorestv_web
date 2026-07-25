"use client";

import { useState } from "react";
import type { VolleyballTeamDetailResponse } from "@/lib/volleyball-team-types";
import { VolleyballTeamFixtureRow } from "../VolleyballTeamFixtureRow";

interface Props {
  detail: VolleyballTeamDetailResponse;
  lang: "tr" | "en";
}

export function VolleyballTeamFixturesTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const upcoming = detail.upcomingGames ?? [];
  const recent = detail.recentGames ?? [];
  const [mode, setMode] = useState<"upcoming" | "recent">(
    upcoming.length > 0 ? "upcoming" : "recent",
  );

  if (upcoming.length === 0 && recent.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Fikstür yok", "No fixtures")}</p>
        </section>
      </div>
    );
  }

  const list = mode === "upcoming" ? upcoming : recent;
  return (
    <div className="match-tab">
      <div className="standings-group-tabs-wrap">
        <div className="standings-group-tabs">
          <button
            type="button"
            onClick={() => setMode("upcoming")}
            className={`standings-group-tab ${mode === "upcoming" ? "is-active" : ""}`}
          >
            {t("Yaklaşan", "Upcoming")}
          </button>
          <button
            type="button"
            onClick={() => setMode("recent")}
            className={`standings-group-tab ${mode === "recent" ? "is-active" : ""}`}
          >
            {t("Son Maçlar", "Recent")}
          </button>
        </div>
      </div>
      <section className="match-card">
        <ul className="lig-fix-list">
          {list.map((g, idx) => (
            <li key={`${g.id}-${idx}`}>
              <VolleyballTeamFixtureRow g={g} lang={lang} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
