"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import { TeamLogo } from "@/components/shell/TeamLogo";
import type { LeagueDetailResponse } from "@/lib/league-detail-types";

interface Props {
  detail: LeagueDetailResponse;
  selectedSeason: number | null;
  onSeasonChange: (season: number) => void;
  lang: "tr" | "en";
}

export function LeagueHero({ detail, selectedSeason, onSeasonChange, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const cur = selectedSeason ?? detail.selectedSeason ?? detail.currentSeason ?? null;
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
          <div className="league-hero-season">
            <label className="league-hero-season-label">
              {t("Sezon", "Season")}
            </label>
            <select
              className="league-hero-season-select"
              value={cur ?? ""}
              onChange={(e) => onSeasonChange(Number(e.target.value))}
            >
              {detail.seasons.map((s) => (
                <option key={s.year} value={s.year}>
                  {s.year}
                  {s.current ? ` · ${t("Aktif", "Current")}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
