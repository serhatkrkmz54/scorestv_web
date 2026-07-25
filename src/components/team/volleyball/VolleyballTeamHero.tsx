"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import { TeamLogo } from "@/components/shell/TeamLogo";
import type { VolleyballTeamDetailResponse } from "@/lib/volleyball-team-types";

interface Props {
  detail: VolleyballTeamDetailResponse;
  lang: "tr" | "en";
}

// Voleybol takim hero — basketbol TeamHero'nun LEANER esi (sezon secici ve
// salon bilgisi yok; backend saglamiyor).
export function VolleyballTeamHero({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const name = detail.displayName ?? detail.name ?? "";
  return (
    <section className="match-hero team-hero">
      <div className="match-hero-bg" aria-hidden>
        {detail.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={detail.logo} alt={name} className="match-hero-bg-logo" />
        ) : null}
        <div className="match-hero-bg-gradient" />
      </div>

      <div className="match-hero-content team-hero-content">
        <div className="team-hero-row">
          <TeamLogo name={name} logo={detail.logo ?? null} size={84} />
          <div className="team-hero-text">
            <div className="team-hero-meta">
              {detail.countryName ? (
                <span className="team-hero-country">
                  <CountryFlag
                    flag={detail.countryFlag ?? null}
                    country={detail.countryName ?? ""}
                    size={16}
                  />
                  <span>{detail.countryName}</span>
                </span>
              ) : null}
              {detail.national ? (
                <span className="team-hero-badge is-national">
                  {t("Milli Takım", "National Team")}
                </span>
              ) : null}
              {detail.season ? (
                <span className="team-hero-founded">
                  {t("Sezon", "Season")}: {detail.season}
                </span>
              ) : null}
            </div>
            <h1 className="team-hero-name">{name}</h1>
          </div>
        </div>
      </div>
    </section>
  );
}
