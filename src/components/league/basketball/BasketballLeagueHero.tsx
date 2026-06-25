"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import { TeamLogo } from "@/components/shell/TeamLogo";
import type { BasketballLeagueDetailResponse } from "@/lib/basketball-league-types";

interface Props {
  detail: BasketballLeagueDetailResponse;
  selectedSeason: string | null;
  onSeasonChange: (season: string) => void;
  lang: "tr" | "en";
}

// Basketbol lig hero — futbol LeagueHero esi. Fark: sezon string ("2024-2025").
export function BasketballLeagueHero({
  detail,
  selectedSeason,
  onSeasonChange,
  lang,
}: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const cur =
    selectedSeason ?? detail.selectedSeason ?? detail.currentSeason ?? "";
  return (
    <section className="match-hero league-hero">
      <div className="match-hero-bg" aria-hidden>
        {detail.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={detail.logo} alt="" className="match-hero-bg-logo" />
        ) : null}
        <div className="match-hero-bg-gradient" />
      </div>

      <div className="match-hero-content league-hero-content">
        <div className="league-hero-row">
          <TeamLogo name={detail.name} logo={detail.logo ?? null} size={72} />
          <div className="league-hero-text">
            <div className="league-hero-meta">
              {detail.country ? (
                <span className="league-hero-country">
                  {detail.country.flag || detail.country.name ? (
                    <CountryFlag
                      flag={detail.country.flag ?? null}
                      country={detail.country.name ?? ""}
                      size={16}
                    />
                  ) : null}
                  <span>{detail.country.name}</span>
                </span>
              ) : null}
              {detail.type ? (
                <span className="league-hero-type">{detail.type}</span>
              ) : null}
            </div>
            <h1 className="league-hero-name">{detail.name}</h1>
          </div>
          {detail.seasons.length > 0 ? (
            <div className="league-hero-season">
              <label className="league-hero-season-label">
                {t("Sezon", "Season")}
              </label>
              <select
                className="league-hero-season-select"
                value={cur}
                onChange={(e) => onSeasonChange(e.target.value)}
              >
                {detail.seasons.map((s) => (
                  <option key={s.season} value={s.season}>
                    {s.season}
                    {s.current ? ` · ${t("Aktif", "Current")}` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
