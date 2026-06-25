"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import { IconList, IconTrophy, IconHeart2, IconGlobe } from "@/components/icons";
import type { BasketballLeagueDetailResponse } from "@/lib/basketball-league-types";

interface Props {
  detail: BasketballLeagueDetailResponse;
  lang: "tr" | "en";
}

// Basketbol lig sag-ray bilgi karti — futbol LeagueSideInfo esi.
export function BasketballLeagueSideInfo({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];
  if (detail.country) {
    rows.push({
      icon: (
        <CountryFlag
          flag={detail.country.flag ?? null}
          country={detail.country.name ?? ""}
          size={16}
        />
      ),
      label: t("Ülke", "Country"),
      value: detail.country.name ?? "—",
    });
  }
  if (detail.type) {
    rows.push({ icon: <IconTrophy s={16} />, label: t("Tip", "Type"), value: detail.type });
  }
  const season = detail.selectedSeason ?? detail.currentSeason;
  if (season) {
    rows.push({ icon: <IconList s={16} />, label: t("Sezon", "Season"), value: season });
  }
  rows.push({
    icon: <IconGlobe s={16} />,
    label: t("Sezon Sayısı", "Seasons"),
    value: String(detail.seasons.length),
  });
  return (
    <div className="rl-section">
      <header className="rl-head">
        <IconHeart2 s={14} />
        <span>{t("Lig Bilgisi", "League Info")}</span>
      </header>
      {rows.map((r, i) => (
        <div key={i} className="rl-item msi-row-3">
          <span className="msi-icon-slot">{r.icon}</span>
          <span className="msi-label">{r.label}</span>
          <span className="msi-value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
