"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import { IconList, IconTrophy, IconHeart2 } from "@/components/icons";
import type { VolleyballTeamDetailResponse } from "@/lib/volleyball-team-types";

interface Props {
  detail: VolleyballTeamDetailResponse;
  lang: "tr" | "en";
}

// Voleybol takim sag-ray bilgi karti — basketbol TeamSideInfo esi.
export function VolleyballTeamSideInfo({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];

  if (detail.countryName) {
    rows.push({
      icon: (
        <CountryFlag flag={detail.countryFlag ?? null} country={detail.countryName ?? ""} size={16} />
      ),
      label: t("Ülke", "Country"),
      value: detail.countryName ?? "—",
    });
  }
  rows.push({
    icon: <IconList s={16} />,
    label: t("Tip", "Type"),
    value: detail.national ? t("Milli Takım", "National Team") : t("Kulüp", "Club"),
  });
  if (detail.season) {
    rows.push({ icon: <IconTrophy s={16} />, label: t("Sezon", "Season"), value: detail.season });
  }
  if (detail.seasonStats?.leagueName) {
    rows.push({
      icon: <IconTrophy s={16} />,
      label: t("Lig", "League"),
      value: detail.seasonStats.leagueName,
    });
  }

  return (
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
  );
}
