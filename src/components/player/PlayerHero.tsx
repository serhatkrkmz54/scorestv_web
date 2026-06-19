"use client";

import Link from "next/link";
import { teamPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import type { PlayerDetailResponse } from "@/lib/player-detail-types";

// API ham değerleri: "187" / "187 cm" / "83" / "83 kg" gelebilir.
// İçinde unit yoksa ekle; varsa olduğu gibi göster.
function formatHeight(h: string): string {
  const t = h.trim();
  if (!t) return t;
  if (/\d+\s*(cm|m|ft|in)/i.test(t)) return t;
  return /^\d+(\.\d+)?$/.test(t) ? `${t} cm` : t;
}
function formatWeight(w: string): string {
  const t = w.trim();
  if (!t) return t;
  if (/\d+\s*(kg|lb|lbs|g)/i.test(t)) return t;
  return /^\d+(\.\d+)?$/.test(t) ? `${t} kg` : t;
}


interface Props {
  detail: PlayerDetailResponse;
  selectedSeason: number | null;
  onSeasonChange: (season: number) => void;
  lang: "tr" | "en";
}

export function PlayerHero({ detail, selectedSeason, onSeasonChange, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  // API-Football lineup/event endpointleri "M. Müldür" kisa form doner. Backend
  // /players/profiles'tan tam isim ("Mert" + "Müldür") hidrate eder; PlayerDetail
  // response'unda firstName+lastName dolar. Burada tam form varsa onu, yoksa
  // kisa name fallback'i kullan — hidratasyon tamamlaninca otomatik duzelir.
  const fullName = (detail.firstName && detail.lastName)
    ? `${detail.firstName} ${detail.lastName}`
    : detail.name;
  const cur = selectedSeason ?? detail.selectedSeason ?? null;
  const photo = detail.photo
    ?? `https://media.api-sports.io/football/players/${detail.id}.png`;
  const initials = (detail.name ?? "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => (s ? s[0].toUpperCase() : ""))
    .join("");
  return (
    <section className="match-hero player-hero">
      <div className="match-hero-bg" aria-hidden>
        <div className="match-hero-bg-gradient" />
      </div>

      <div className="match-hero-content player-hero-content">
        <div className="player-hero-row">
          <div className="player-hero-photo">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={detail.name} loading="eager" />
            ) : (
              <span className="player-hero-initials">{initials}</span>
            )}
          </div>
          <div className="player-hero-text">
            <h1 className="player-hero-name" title={detail.name !== fullName ? detail.name : undefined}>{fullName}</h1>
            <div className="player-hero-meta">
              {detail.positionText ? (
                <span className="player-hero-pos">{detail.positionText}</span>
              ) : null}
              {detail.footText ? (
                <span className="player-hero-foot">{detail.footText}</span>
              ) : null}
              {detail.nationalityText || detail.nationality ? (
                <span className="player-hero-nat">
                  {detail.nationalityText ?? detail.nationality}
                </span>
              ) : null}
              {detail.age != null ? (
                <span className="player-hero-age">
                  {detail.age} {t("yaş", "y/o")}
                </span>
              ) : null}
              {detail.height ? (
                <span className="player-hero-stat" title={t("Boy", "Height")}>
                  <span className="player-hero-stat-lbl">{t("Boy", "Height")}:</span>
                  <span className="player-hero-stat-val">{formatHeight(detail.height)}</span>
                </span>
              ) : null}
              {detail.weight ? (
                <span className="player-hero-stat" title={t("Kilo", "Weight")}>
                  <span className="player-hero-stat-lbl">{t("Kilo", "Weight")}:</span>
                  <span className="player-hero-stat-val">{formatWeight(detail.weight)}</span>
                </span>
              ) : null}
              {detail.injured ? (
                <span className="player-hero-injured">
                  {t("Sakat", "Injured")}
                </span>
              ) : null}
            </div>
            {detail.currentTeam ? (
              <div className="player-hero-team">
                {detail.currentTeam.slug ? (
                  <Link
                    href={teamPath(lang, detail.currentTeam.slug)}
                    className="player-hero-team-link"
                  >
                    <TeamLogo
                      name={detail.currentTeam.name}
                      logo={detail.currentTeam.logo ?? null}
                      size={20}
                    />
                    <span>{detail.currentTeam.name}</span>
                  </Link>
                ) : (
                  <span className="player-hero-team-link">
                    <TeamLogo
                      name={detail.currentTeam.name}
                      logo={detail.currentTeam.logo ?? null}
                      size={20}
                    />
                    <span>{detail.currentTeam.name}</span>
                  </span>
                )}
              </div>
            ) : null}
          </div>
          {detail.seasons && detail.seasons.length > 0 ? (
            <div className="player-hero-season">
              <label className="player-hero-season-label">
                {t("Sezon", "Season")}
              </label>
              <select
                className="player-hero-season-select"
                value={cur ?? ""}
                onChange={(e) => onSeasonChange(Number(e.target.value))}
              >
                {detail.seasons.map((y) => (
                  <option key={y} value={y}>
                    {y}
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
