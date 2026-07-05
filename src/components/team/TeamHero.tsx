"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import { TeamLogo } from "@/components/shell/TeamLogo";
import type { TeamDetailResponse } from "@/lib/team-detail-types";

interface Props {
  detail: TeamDetailResponse;
  selectedSeason: number | null;
  onSeasonChange: (season: number) => void;
  lang: "tr" | "en";
}

export function TeamHero({ detail, selectedSeason, onSeasonChange, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const cur = selectedSeason ?? detail.selectedSeason ?? null;
  return (
    <section className="match-hero team-hero">
      <div className="match-hero-bg" aria-hidden>
        {detail.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={detail.logo} alt="" className="match-hero-bg-logo" />
        ) : null}
        <div className="match-hero-bg-gradient" />
      </div>

      <div className="match-hero-content team-hero-content">
        <div className="team-hero-row">
          <TeamLogo name={detail.name} logo={detail.logo ?? null} size={84} />
          <div className="team-hero-text">
            <div className="team-hero-meta">
              {detail.country ? (
                <span className="team-hero-country">
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
              {detail.national ? (
                <span className="team-hero-badge is-national">
                  {t("Milli Takım", "National Team")}
                </span>
              ) : null}
              {detail.code ? (
                <span className="team-hero-code">{detail.code}</span>
              ) : null}
              {detail.founded ? (
                <span className="team-hero-founded">
                  {t("Kuruluş", "Founded")}: {detail.founded}
                </span>
              ) : null}
            </div>
            <h1 className="team-hero-name">{detail.name}</h1>
            {detail.fifaRank != null ? (
              <div className="team-hero-fifa">
                {t("FIFA Sıralaması", "FIFA Ranking")}: #{detail.fifaRank}
              </div>
            ) : null}
            {detail.venue?.name ? (
              <div className="team-hero-venue">
                <span className="team-hero-venue-name">{detail.venue.name}</span>
                {detail.venue.city ? (
                  <span className="team-hero-venue-sep">·</span>
                ) : null}
                {detail.venue.city ? (
                  <span className="team-hero-venue-city">{detail.venue.city}</span>
                ) : null}
                {detail.venue.capacity ? (
                  <>
                    <span className="team-hero-venue-sep">·</span>
                    <span className="team-hero-venue-cap">
                      {detail.venue.capacity.toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}{" "}
                      {t("kişilik", "seats")}
                    </span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
          {detail.seasons && detail.seasons.length > 0 ? (
            <div className="team-hero-season">
              <label className="team-hero-season-label">
                {t("Sezon", "Season")}
              </label>
              <select
                className="team-hero-season-select"
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
          ) : null}
        </div>
      </div>
    </section>
  );
}
