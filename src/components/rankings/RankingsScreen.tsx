"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { teamPath } from "@/lib/routes";
import {
  IconTrophy,
  IconGlobe,
  IconList,
} from "@/components/icons";
import type {
  FifaRankingResponse,
  UefaClubRankingResponse,
  UefaCountryRankingResponse,
  UefaClubRow,
  UefaCountryRow,
} from "@/lib/rankings-types";

type Cat = "fifa" | "uefa-clubs" | "uefa-countries";

interface Props {
  initialFifa: FifaRankingResponse | null;
  initialClubs: UefaClubRankingResponse | null;
  initialCountries: UefaCountryRankingResponse | null;
  lang: "tr" | "en";
}

function fmtPoints(p: number | string | null | undefined): string {
  if (p == null || p === "") return "—";
  const n = typeof p === "number" ? p : parseFloat(String(p));
  if (!isFinite(n)) return String(p);
  return n.toFixed(3).replace(/\.?0+$/, "");
}

function fmtDate(iso: string | null | undefined, lang: "tr" | "en"): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      timeZone: "Europe/Istanbul",
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(iso));
  } catch { return ""; }
}

function MovementBadge({ m, trend }: { m?: number | null; trend?: string | null }) {
  let dir: "up" | "down" | "flat" = "flat";
  let label = "—";
  if (typeof m === "number") {
    if (m > 0) { dir = "up"; label = `↑${m}`; }
    else if (m < 0) { dir = "down"; label = `↓${Math.abs(m)}`; }
    else { dir = "flat"; label = "="; }
  } else if (trend) {
    const tt = trend.toUpperCase();
    if (tt === "UP") { dir = "up"; label = "↑"; }
    else if (tt === "DOWN") { dir = "down"; label = "↓"; }
    else { dir = "flat"; label = "="; }
  }
  return <span className={`rk-mv rk-mv-${dir}`}>{label}</span>;
}

// ─────────────────────────────────────────────────────────────────────
// Sezon detay modal — UEFA club + UEFA country row tıklamasında acilir
// ─────────────────────────────────────────────────────────────────────

interface SeasonDetailData {
  title: string;
  subtitle?: string | null;
  seasonRankings: Array<Record<string, unknown>>;
  totalPoints: number | string | null | undefined;
  numberOfMatches?: number | null;
  numberOfTeams?: number | null;
}

function SeasonModal({
  data,
  lang,
  onClose,
}: {
  data: SeasonDetailData | null;
  lang: "tr" | "en";
  onClose: () => void;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  // ESC ile kapat
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Body scroll kilit
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [data, onClose]);

  if (!data) return null;
  // SSR guard — createPortal sadece client'ta document.body'ye mount eder.
  if (typeof document === "undefined") return null;

  // Sezon satırlarını yıla göre azalan sırala. Backend genelde sıralı gönderir
  // ama defansif olarak kendi sıralayalım.
  const seasons = [...(data.seasonRankings ?? [])].sort((a, b) => {
    const ay = Number(a.seasonYear ?? a.season ?? 0);
    const by = Number(b.seasonYear ?? b.season ?? 0);
    return by - ay;
  });

  // Portal: modal'i parent'in transform/overflow scope'undan kacir.
  // body altina mount ederek z-index ve fixed positioning garantilenir.
  return createPortal(
    <div className="rk-modal-overlay" onClick={onClose} role="presentation">
      <div className="rk-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="rk-modal-head">
          <div className="rk-modal-title">
            <h3>{data.title}</h3>
            {data.subtitle ? <span className="rk-modal-sub">{data.subtitle}</span> : null}
          </div>
          <button type="button" className="rk-modal-close" onClick={onClose} aria-label={t("Kapat", "Close")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="rk-modal-body">
          <div className="rk-modal-stat-row">
            <div className="rk-modal-stat">
              <span className="rk-modal-stat-lbl">{t("Toplam Puan", "Total Points")}</span>
              <span className="rk-modal-stat-val tnum">{fmtPoints(data.totalPoints)}</span>
            </div>
            {data.numberOfMatches != null ? (
              <div className="rk-modal-stat">
                <span className="rk-modal-stat-lbl">{t("Maç", "Matches")}</span>
                <span className="rk-modal-stat-val tnum">{data.numberOfMatches}</span>
              </div>
            ) : null}
            {data.numberOfTeams != null ? (
              <div className="rk-modal-stat">
                <span className="rk-modal-stat-lbl">{t("Takım", "Teams")}</span>
                <span className="rk-modal-stat-val tnum">{data.numberOfTeams}</span>
              </div>
            ) : null}
          </div>
          {seasons.length > 0 ? (
            <>
              <div className="rk-modal-section-lbl">
                {t("Sezon Bazlı Puanlar", "Season-by-Season Points")}
              </div>
              <ul className="rk-modal-seasons">
                {seasons.map((s, i) => {
                  const year = s.seasonYear ?? s.season ?? "—";
                  const pts = s.totalPoints ?? s.points ?? null;
                  const pos = s.position ?? s.rank ?? null;
                  return (
                    <li key={i} className="rk-modal-season-row">
                      <span className="rk-modal-season-year tnum">{String(year)}</span>
                      <span className="rk-modal-season-pts tnum">{fmtPoints(pts as number | string | null | undefined)}</span>
                      {pos != null ? (
                        <span className="rk-modal-season-pos">
                          #{String(pos)}
                        </span>
                      ) : (
                        <span className="rk-modal-season-pos rk-modal-season-pos-empty">—</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="match-empty">{t("Sezon detayı yok", "No season details")}</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────────────
// RankingsScreen — 3 alt-tab + tıklamada modal
// ─────────────────────────────────────────────────────────────────────

export function RankingsScreen({
  initialFifa,
  initialClubs,
  initialCountries,
  lang,
}: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [cat, setCat] = useState<Cat>("fifa");
  const [modal, setModal] = useState<SeasonDetailData | null>(null);

  const tabs: { key: Cat; label: string; icon: React.ReactNode }[] = [
    { key: "fifa", label: t("FIFA Milli", "FIFA Men"), icon: <IconGlobe s={14} /> },
    { key: "uefa-clubs", label: t("UEFA Kulüp", "UEFA Clubs"), icon: <IconTrophy s={14} /> },
    { key: "uefa-countries", label: t("UEFA Ülke", "UEFA Countries"), icon: <IconList s={14} /> },
  ];

  const openClub = (r: UefaClubRow) => {
    setModal({
      title: r.clubShortName ?? r.clubName,
      subtitle: r.countryName ?? r.countryCode ?? null,
      seasonRankings: r.seasonRankings ?? [],
      totalPoints: r.totalPoints,
      numberOfMatches: r.numberOfMatches,
      numberOfTeams: r.numberOfTeams,
    });
  };
  const openCountry = (r: UefaCountryRow) => {
    setModal({
      title: r.countryName,
      subtitle: r.countryCode ?? null,
      seasonRankings: r.seasonRankings ?? [],
      totalPoints: r.totalPoints,
      numberOfMatches: r.numberOfMatches,
      numberOfTeams: r.numberOfTeams,
    });
  };

  return (
    <div className="rankings-screen">
      <header className="rankings-hero">
        <h1 className="rankings-hero-title">{t("Sıralamalar", "Rankings")}</h1>
        <p className="rankings-hero-sub">
          {t(
            "FIFA Erkek Milli Takım, UEFA Kulüp Katsayısı ve UEFA Ülke Katsayısı sıralamaları.",
            "FIFA Men's National Team, UEFA Club Coefficient and UEFA Country Coefficient.",
          )}
        </p>
      </header>

      <nav className="match-tabs" role="tablist">
        <div className="match-tabs-scroll">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              role="tab"
              aria-selected={tb.key === cat}
              className={`match-tab-pill ${tb.key === cat ? "is-active" : ""}`}
              onClick={() => setCat(tb.key)}
            >
              <span className="match-tab-icon">{tb.icon}</span>
              <span className="match-tab-label">{tb.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="rankings-body">
        {cat === "fifa" ? <FifaTable data={initialFifa} lang={lang} /> : null}
        {cat === "uefa-clubs" ? <ClubsTable data={initialClubs} lang={lang} onRowClick={openClub} /> : null}
        {cat === "uefa-countries" ? <CountriesTable data={initialCountries} lang={lang} onRowClick={openCountry} /> : null}
      </div>

      <SeasonModal data={modal} lang={lang} onClose={() => setModal(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// FIFA Milli
// ─────────────────────────────────────────────────────────────────────

function FifaTable({ data, lang }: { data: FifaRankingResponse | null; lang: "tr" | "en" }) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  if (!data || !data.teams || data.teams.length === 0) {
    return (
      <section className="match-card">
        <p className="match-empty">{t("Sıralama verisi yok", "No ranking data")}</p>
      </section>
    );
  }
  return (
    <section className="match-card rankings-card">
      <header className="match-card-head rankings-card-head">
        <h3>
          <IconGlobe s={14} /> {t("FIFA Erkek Milli Takım Sıralaması", "FIFA Men's National Team Ranking")}
        </h3>
        <span className="rankings-meta">
          {data.totalTeams} {t("takım", "teams")}
          {data.lastUpdated ? ` · ${fmtDate(data.lastUpdated, lang)}` : ""}
        </span>
      </header>
      <div className="rankings-table-wrap">
        <table className="rankings-table">
          <thead>
            <tr>
              <th className="rk-col-rank">#</th>
              <th className="rk-col-mv">{t("Hareket", "Mov.")}</th>
              <th className="rk-col-team">{t("Takım", "Team")}</th>
              <th className="rk-col-conf">{t("Konfed.", "Conf.")}</th>
              <th className="rk-col-pts">{t("Puan", "Points")}</th>
              <th className="rk-col-prev">{t("Önceki", "Prev")}</th>
            </tr>
          </thead>
          <tbody>
            {data.teams.map((r, i) => {
              const teamCell = (
                <span className="rk-team-cell">
                  <TeamLogo name={r.teamName} logo={r.flagUrl ?? null} size={20} />
                  <span>{r.teamName}</span>
                </span>
              );
              return (
                <tr key={`${r.teamId}-${i}`}>
                  <td className="rk-col-rank tnum">{r.rank ?? "—"}</td>
                  <td className="rk-col-mv"><MovementBadge m={r.movement} /></td>
                  <td className="rk-col-team">
                    {r.teamSlug ? (
                      <Link href={teamPath(lang, r.teamSlug)} className="rk-team-link">{teamCell}</Link>
                    ) : (
                      teamCell
                    )}
                  </td>
                  <td className="rk-col-conf">{r.confederation ?? ""}</td>
                  <td className="rk-col-pts tnum">{fmtPoints(r.totalPoints)}</td>
                  <td className="rk-col-prev tnum">{fmtPoints(r.prevPoints)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// UEFA Kulüp — row tıklanca sezon modal
// ─────────────────────────────────────────────────────────────────────

function ClubsTable({
  data,
  lang,
  onRowClick,
}: {
  data: UefaClubRankingResponse | null;
  lang: "tr" | "en";
  onRowClick: (r: UefaClubRow) => void;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  if (!data || !data.clubs || data.clubs.length === 0) {
    return (
      <section className="match-card">
        <p className="match-empty">{t("Sıralama verisi yok", "No ranking data")}</p>
      </section>
    );
  }
  return (
    <section className="match-card rankings-card">
      <header className="match-card-head rankings-card-head">
        <h3>
          <IconTrophy s={14} /> {t("UEFA Kulüp Katsayısı", "UEFA Club Coefficient")}
          {data.targetSeasonYear ? <span className="rk-season tnum">{data.targetSeasonYear}</span> : null}
        </h3>
        <span className="rankings-meta">
          {data.totalClubs} {t("kulüp", "clubs")}
          {data.lastUpdated ? ` · ${fmtDate(data.lastUpdated, lang)}` : ""}
        </span>
      </header>
      <div className="rankings-table-wrap">
        <table className="rankings-table">
          <thead>
            <tr>
              <th className="rk-col-rank">#</th>
              <th className="rk-col-team">{t("Kulüp", "Club")}</th>
              <th className="rk-col-country">{t("Ülke", "Country")}</th>
              <th className="rk-col-pts">{t("Puan", "Points")}</th>
              <th className="rk-col-trend">{t("Trend", "Trend")}</th>
            </tr>
          </thead>
          <tbody>
            {data.clubs.map((r, i) => {
              const logo = r.mediumLogoUrl ?? r.logoUrl ?? r.bigLogoUrl ?? null;
              return (
                <tr
                  key={`${r.clubId}-${i}`}
                  className="rk-row-clickable"
                  onClick={() => onRowClick(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") onRowClick(r); }}
                >
                  <td className="rk-col-rank tnum">{r.rank ?? "—"}</td>
                  <td className="rk-col-team">
                    <span className="rk-team-cell">
                      <TeamLogo name={r.clubName} logo={logo} size={22} />
                      <span>{r.clubShortName ?? r.clubName}</span>
                    </span>
                  </td>
                  <td className="rk-col-country">{r.countryName ?? r.countryCode ?? ""}</td>
                  <td className="rk-col-pts tnum">{fmtPoints(r.totalPoints)}</td>
                  <td className="rk-col-trend"><MovementBadge trend={r.trend} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// UEFA Ülke — row tıklanca sezon modal
// ─────────────────────────────────────────────────────────────────────

function CountriesTable({
  data,
  lang,
  onRowClick,
}: {
  data: UefaCountryRankingResponse | null;
  lang: "tr" | "en";
  onRowClick: (r: UefaCountryRow) => void;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  if (!data || !data.countries || data.countries.length === 0) {
    return (
      <section className="match-card">
        <p className="match-empty">{t("Sıralama verisi yok", "No ranking data")}</p>
      </section>
    );
  }
  return (
    <section className="match-card rankings-card">
      <header className="match-card-head rankings-card-head">
        <h3>
          <IconList s={14} /> {t("UEFA Ülke Katsayısı", "UEFA Country Coefficient")}
          {data.targetSeasonYear ? <span className="rk-season tnum">{data.targetSeasonYear}</span> : null}
        </h3>
        <span className="rankings-meta">
          {data.totalCountries} {t("ülke", "countries")}
          {data.lastUpdated ? ` · ${fmtDate(data.lastUpdated, lang)}` : ""}
        </span>
      </header>
      <div className="rankings-table-wrap">
        <table className="rankings-table">
          <thead>
            <tr>
              <th className="rk-col-rank">#</th>
              <th className="rk-col-team">{t("Ülke", "Country")}</th>
              <th className="rk-col-teamsnum">{t("Takım", "Teams")}</th>
              <th className="rk-col-pts">{t("Puan", "Points")}</th>
              <th className="rk-col-trend">{t("Trend", "Trend")}</th>
            </tr>
          </thead>
          <tbody>
            {data.countries.map((r, i) => {
              const logo = r.mediumLogoUrl ?? r.logoUrl ?? r.bigLogoUrl ?? null;
              return (
                <tr
                  key={`${r.countryUefaId}-${i}`}
                  className="rk-row-clickable"
                  onClick={() => onRowClick(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") onRowClick(r); }}
                >
                  <td className="rk-col-rank tnum">{r.rank ?? "—"}</td>
                  <td className="rk-col-team">
                    <span className="rk-team-cell">
                      <TeamLogo name={r.countryName} logo={logo} size={22} />
                      <span>{r.countryName}</span>
                    </span>
                  </td>
                  <td className="rk-col-teamsnum tnum">{r.numberOfTeams ?? "—"}</td>
                  <td className="rk-col-pts tnum">{fmtPoints(r.totalPoints)}</td>
                  <td className="rk-col-trend"><MovementBadge trend={r.trend} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
