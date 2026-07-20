"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import { TeamLogo } from "@/components/shell/TeamLogo";
import type { BasketballTeamDetailResponse } from "@/lib/basketball-team-types";

interface Props {
  detail: BasketballTeamDetailResponse;
  selectedSeason: string | null;
  onSeasonChange: (season: string) => void;
  lang: "tr" | "en";
}

// Basketbol takim hero — futbol TeamHero esi. Sezon string ("2024-2025").
export function BasketballTeamHero({ detail, selectedSeason, onSeasonChange, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const hero = detail.hero;
  const name = hero.displayName ?? hero.name;
  const cur = selectedSeason ?? detail.selectedSeason ?? "";
  return (
    <section className="match-hero team-hero">
      <div className="match-hero-bg" aria-hidden>
        {hero.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.logo} alt={name} className="match-hero-bg-logo" />
        ) : null}
        <div className="match-hero-bg-gradient" />
      </div>

      <div className="match-hero-content team-hero-content">
        <div className="team-hero-row">
          <TeamLogo name={name} logo={hero.logo ?? null} size={84} />
          <div className="team-hero-text">
            <div className="team-hero-meta">
              {hero.countryName ? (
                <span className="team-hero-country">
                  {hero.countryFlag || hero.countryName ? (
                    <CountryFlag
                      flag={hero.countryFlag ?? null}
                      country={hero.countryName ?? ""}
                      size={16}
                    />
                  ) : null}
                  <span>{hero.countryName}</span>
                </span>
              ) : null}
              {hero.national ? (
                <span className="team-hero-badge is-national">
                  {t("Milli Takım", "National Team")}
                </span>
              ) : null}
              {hero.code ? <span className="team-hero-code">{hero.code}</span> : null}
              {hero.founded ? (
                <span className="team-hero-founded">
                  {t("Kuruluş", "Founded")}: {hero.founded}
                </span>
              ) : null}
            </div>
            <h1 className="team-hero-name">{name}</h1>
            {hero.venueName ? (
              <div className="team-hero-venue">
                <span className="team-hero-venue-name">{hero.venueName}</span>
                {hero.venueCity ? <span className="team-hero-venue-sep">·</span> : null}
                {hero.venueCity ? (
                  <span className="team-hero-venue-city">{hero.venueCity}</span>
                ) : null}
                {hero.venueCapacity ? (
                  <>
                    <span className="team-hero-venue-sep">·</span>
                    <span className="team-hero-venue-cap">
                      {hero.venueCapacity.toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}{" "}
                      {t("kişilik", "seats")}
                    </span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
          {detail.availableSeasons.length > 0 ? (
            <div className="team-hero-season">
              <label className="team-hero-season-label">{t("Sezon", "Season")}</label>
              <select
                className="team-hero-season-select"
                value={cur}
                onChange={(e) => onSeasonChange(e.target.value)}
              >
                {detail.availableSeasons.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
