"use client";

import Link from "next/link";
import { CountryFlag } from "@/components/shell/CountryFlag";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { basketballLeaguePath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import {
  IconBall,
  IconList,
  IconTrophy,
  IconHeart2,
  IconLineup,
} from "@/components/icons";
import type { BasketballTeamDetailResponse } from "@/lib/basketball-team-types";

interface Props {
  detail: BasketballTeamDetailResponse;
  lang: "tr" | "en";
}

// Basketbol takim sag-ray bilgi karti — futbol TeamSideInfo esi.
export function BasketballTeamSideInfo({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const hero = detail.hero;
  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];

  if (hero.countryName) {
    rows.push({
      icon: (
        <CountryFlag flag={hero.countryFlag ?? null} country={hero.countryName ?? ""} size={16} />
      ),
      label: t("Ülke", "Country"),
      value: hero.countryName ?? "—",
    });
  }
  if (hero.founded) {
    rows.push({ icon: <IconBall s={16} />, label: t("Kuruluş", "Founded"), value: String(hero.founded) });
  }
  rows.push({
    icon: <IconList s={16} />,
    label: t("Tip", "Type"),
    value: hero.national ? t("Milli Takım", "National Team") : t("Kulüp", "Club"),
  });
  if (detail.selectedSeason) {
    rows.push({ icon: <IconTrophy s={16} />, label: t("Sezon", "Season"), value: detail.selectedSeason });
  }
  if (hero.venueName) {
    rows.push({ icon: <IconLineup s={16} />, label: t("Salon", "Venue"), value: hero.venueName });
  }
  if (hero.venueCity) {
    rows.push({ icon: <IconLineup s={16} />, label: t("Şehir", "City"), value: hero.venueCity });
  }
  if (hero.venueCapacity) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Kapasite", "Capacity"),
      value: hero.venueCapacity.toLocaleString(lang === "tr" ? "tr-TR" : "en-US"),
    });
  }

  const league = detail.leagueRef;
  return (
    <>
      <div className="rl-section">
        <header className="rl-head">
          <IconHeart2 s={14} />
          <span>{t("Takım Bilgisi", "Team Info")}</span>
        </header>
        {rows.map((r, i) => {
          const titleAttr = typeof r.value === "string" ? r.value : undefined;
          return (
            <div key={i} className="rl-item msi-row-3">
              <span className="msi-icon-slot">{r.icon}</span>
              <span className="msi-label">{r.label}</span>
              <span className="msi-value" title={titleAttr}>{r.value}</span>
            </div>
          );
        })}
      </div>

      {league && league.id ? (
        <div className="rl-section">
          <header className="rl-head">
            <IconTrophy s={14} />
            <span>{t("Lig", "League")}</span>
          </header>
          <Link
            href={basketballLeaguePath(
              lang,
              league.slug ?? buildEntitySlug(league.name, league.id),
            )}
            className="rl-item"
          >
            <TeamLogo name={league.name} logo={league.logo ?? null} size={21} />
            <span className="nm">{league.displayName ?? league.name}</span>
          </Link>
        </div>
      ) : null}
    </>
  );
}
