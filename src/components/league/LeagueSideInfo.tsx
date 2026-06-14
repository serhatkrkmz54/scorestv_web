"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import {
  IconBall,
  IconList,
  IconTrophy,
  IconHeart2,
} from "@/components/icons";
import type { LeagueDetailResponse } from "@/lib/league-detail-types";

interface Props {
  detail: LeagueDetailResponse;
  lang: "tr" | "en";
}

export function LeagueSideInfo({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const season = detail.seasons.find(
    (s) => s.year === (detail.selectedSeason ?? detail.currentSeason),
  );
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
      label: t("Ulke", "Country"),
      value: detail.country.name ?? "—",
    });
  }
  if (detail.type) {
    rows.push({ icon: <IconTrophy s={16} />, label: t("Tip", "Type"), value: detail.type });
  }
  if (detail.selectedSeason ?? detail.currentSeason) {
    rows.push({
      icon: <IconList s={16} />,
      label: t("Sezon", "Season"),
      value: String(detail.selectedSeason ?? detail.currentSeason),
    });
  }
  if (season?.startDate && season.endDate) {
    rows.push({
      icon: <IconBall s={16} />,
      label: t("Baslangic", "Start"),
      value: season.startDate,
    });
    rows.push({
      icon: <IconBall s={16} />,
      label: t("Bitis", "End"),
      value: season.endDate,
    });
  }
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
