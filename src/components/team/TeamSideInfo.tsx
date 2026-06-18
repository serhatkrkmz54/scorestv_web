"use client";

import { CountryFlag } from "@/components/shell/CountryFlag";
import {
  IconBall,
  IconList,
  IconTrophy,
  IconHeart2,
  IconLineup,
} from "@/components/icons";
import type { TeamDetailResponse } from "@/lib/team-detail-types";

interface Props {
  detail: TeamDetailResponse;
  lang: "tr" | "en";
}

export function TeamSideInfo({ detail, lang }: Props) {
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
  if (detail.founded) {
    rows.push({
      icon: <IconBall s={16} />,
      label: t("Kuruluş", "Founded"),
      value: String(detail.founded),
    });
  }
  rows.push({
    icon: <IconList s={16} />,
    label: t("Tip", "Type"),
    value: detail.national ? t("Milli Takım", "National Team") : t("Kulüp", "Club"),
  });
  if (detail.selectedSeason) {
    rows.push({
      icon: <IconTrophy s={16} />,
      label: t("Sezon", "Season"),
      value: String(detail.selectedSeason),
    });
  }
  if (detail.venue?.name) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Stadyum", "Venue"),
      value: detail.venue.name,
    });
  }
  if (detail.venue?.city) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Şehir", "City"),
      value: detail.venue.city,
    });
  }
  if (detail.venue?.capacity) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Kapasite", "Capacity"),
      value: detail.venue.capacity.toLocaleString(lang === "tr" ? "tr-TR" : "en-US"),
    });
  }
  if (detail.venue?.surface) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Zemin", "Surface"),
      value: detail.venue.surface,
    });
  }
  if (detail.currentCoach?.name) {
    rows.push({
      icon: <IconLineup s={16} />,
      label: t("Tek. Dir.", "Coach"),
      value: detail.currentCoach.name,
    });
  }

  return (
    <div className="rl-section">
      <header className="rl-head">
        <IconHeart2 s={14} />
        <span>{t("Takım Bilgisi", "Team Info")}</span>
      </header>
      {rows.map((r, i) => {
        // String degerlerde hover tooltip — uzun stadyum/koc adi vb. kesilince
        // tam metni native title ile gosterelim.
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
