"use client";

import type { ReactNode } from "react";
import { TeamLogo } from "@/components/shell/TeamLogo";
import {
  IconBell,
  IconStadium,
  IconCalendar,
  IconBall,
  IconWhistle,
  IconTrophy,
  IconUser,
  IconGlobe,
} from "@/components/icons";
import type { MatchDetailResponse } from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

function formatDateTime(iso: string, lang: "tr" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface Row {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

export function MatchSideInfo({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const broadcasts = detail.broadcasts ?? [];

  const rows: Row[] = [];

  rows.push({
    icon: <IconCalendar s={16} />,
    label: t("Tarih", "Date"),
    value: <span className="tnum">{formatDateTime(detail.kickoff, lang)}</span>,
  });

  if (detail.venue?.name) {
    rows.push({
      icon: <IconStadium s={16} />,
      label: t("Stadyum", "Stadium"),
      value: detail.venue.city
        ? detail.venue.name + ", " + detail.venue.city
        : detail.venue.name,
    });
  }
  if (detail.venue?.capacity) {
    rows.push({
      icon: <IconUser s={16} />,
      label: t("Kapasite", "Capacity"),
      value: (
        <span className="tnum">
          {detail.venue.capacity.toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}
        </span>
      ),
    });
  }
  if (detail.venue?.surface) {
    rows.push({
      icon: <IconBall s={16} />,
      label: t("Zemin", "Surface"),
      value: detail.venue.surface,
    });
  }
  if (detail.referee) {
    rows.push({
      icon: <IconWhistle s={16} />,
      label: t("Hakem", "Referee"),
      value: detail.referee,
    });
  }
  if (detail.round) {
    rows.push({
      icon: <IconTrophy s={16} />,
      label: t("Tur", "Round"),
      value: detail.round,
    });
  }
  if (detail.league.country) {
    rows.push({
      icon: <IconGlobe s={16} />,
      label: t("Ulke", "Country"),
      value: detail.league.country,
    });
  }
  if (detail.league.season != null) {
    rows.push({
      icon: <IconCalendar s={16} />,
      label: t("Sezon", "Season"),
      value: <span className="tnum">{detail.league.season}</span>,
    });
  }

  return (
    <>
      {broadcasts.length > 0 ? (
        <div className="rl-section">
          <div className="rl-head">
            <span className="flame">
              <IconBell s={14} />
            </span>
            {t("Yayin", "Broadcast")}
          </div>
          {broadcasts.map((b, i) => (
            <div key={(b.channelId ?? i) + "-" + i} className="rl-item">
              {b.logo ? (
                <TeamLogo name={b.name ?? ""} logo={b.logo} size={21} />
              ) : (
                <span className="msi-icon-slot">
                  <IconBell s={14} />
                </span>
              )}
              <span className="nm">{b.name}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="rl-section">
        <div className="rl-head">
          <span className="flame">
            <IconBall s={14} />
          </span>
          {t("Mac Bilgisi", "Match Info")}
        </div>
        {rows.map((r, i) => (
          <div key={i} className="rl-item msi-row-3">
            <span className="msi-icon-slot">{r.icon}</span>
            <span className="msi-label">{r.label}</span>
            <span className="msi-value">{r.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
