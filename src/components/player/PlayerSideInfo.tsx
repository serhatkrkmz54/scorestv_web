"use client";

import {
  IconBall,
  IconList,
  IconLineup,
  IconHeart2,
  IconMed,
} from "@/components/icons";
import { ageFromBirth, type PlayerDetailResponse } from "@/lib/player-detail-types";

interface Props {
  detail: PlayerDetailResponse;
  lang: "tr" | "en";
}

export function PlayerSideInfo({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];

  if (detail.firstName || detail.lastName) {
    rows.push({
      icon: <IconList s={16} />,
      label: t("Ad", "Name"),
      value: [detail.firstName, detail.lastName].filter(Boolean).join(" ") || detail.name,
    });
  }
  const displayAge = ageFromBirth(detail.birth?.date, detail.age);
  if (displayAge != null) {
    rows.push({
      icon: <IconBall s={16} />,
      label: t("Yaş", "Age"),
      value: String(displayAge),
    });
  }
  if (detail.birth?.date) {
    rows.push({
      icon: <IconBall s={16} />,
      label: t("Doğum Tarihi", "Birth Date"),
      value: detail.birth.date,
    });
  }
  if (detail.birth?.place) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Doğum Yeri", "Birth Place"),
      value: detail.birth.place,
    });
  }
  if (detail.birth?.countryText || detail.birth?.country) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Doğum Ülkesi", "Birth Country"),
      value: detail.birth.countryText ?? detail.birth.country,
    });
  }
  if (detail.nationalityText || detail.nationality) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Milliyet", "Nationality"),
      value: detail.nationalityText ?? detail.nationality,
    });
  }
  if (detail.height) {
    rows.push({
      icon: <IconBall s={16} />,
      label: t("Boy", "Height"),
      value: detail.height,
    });
  }
  if (detail.weight) {
    rows.push({
      icon: <IconBall s={16} />,
      label: t("Kilo", "Weight"),
      value: detail.weight,
    });
  }
  if (detail.injured) {
    rows.push({
      icon: <IconMed s={16} />,
      label: t("Durum", "Status"),
      value: t("Sakat", "Injured"),
    });
  }

  return (
    <div className="rl-section">
      <header className="rl-head">
        <IconHeart2 s={14} />
        <span>{t("Oyuncu Bilgisi", "Player Info")}</span>
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
