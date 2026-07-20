"use client";

import Link from "next/link";
import { teamPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import {
  IconMed,
  IconSwap,
  IconChart,
} from "@/components/icons";
import type {
  PlayerDetailResponse,
  PlayerSeasonStatView,
  PlayerTransferRow,
  PlayerSidelinedRow,
} from "@/lib/player-detail-types";

interface Props {
  detail: PlayerDetailResponse;
  lang: "tr" | "en";
}

function path<T = unknown>(obj: unknown, keys: string[]): T | undefined {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur as T | undefined;
}

function num(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function formatDate(d: string | null | undefined, lang: "tr" | "en"): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(d));
  } catch {
    return d;
  }
}

function SeasonTotalsCard({
  stats,
  lang,
}: {
  stats: PlayerSeasonStatView[];
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  // Tum turnuvalardaki sezon totals'i topla.
  let apps = 0,
    goals = 0,
    assists = 0,
    minutes = 0,
    yellows = 0,
    reds = 0;
  for (const s of stats) {
    const st = s.stats ?? {};
    apps += num(path(st, ["games", "appearences"]));
    minutes += num(path(st, ["games", "minutes"]));
    goals += num(path(st, ["goals", "total"]));
    assists += num(path(st, ["goals", "assists"]));
    yellows += num(path(st, ["cards", "yellow"]));
    reds += num(path(st, ["cards", "red"]));
  }
  const items: { label: string; value: number; cls?: string }[] = [
    { label: t("Maç", "Apps"), value: apps },
    { label: t("Gol", "Goals"), value: goals, cls: "is-accent" },
    { label: t("Asist", "Assists"), value: assists, cls: "is-accent" },
    { label: t("Dakika", "Minutes"), value: minutes },
    { label: t("Sarı", "Yellow"), value: yellows, cls: "is-warn" },
    { label: t("Kırmızı", "Red"), value: reds, cls: "is-danger" },
  ];
  return (
    <section className="match-card">
      <header className="match-card-head">
        <h2>
          <IconChart s={14} /> {t("Sezon Özeti", "Season Summary")}
        </h2>
      </header>
      <div className="player-overview-grid">
        {items.map((it, i) => (
          <div key={i} className={`player-overview-stat ${it.cls ?? ""}`}>
            <span className="player-overview-stat-val tnum">{it.value.toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}</span>
            <span className="player-overview-stat-lbl">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CurrentTeamCard({
  detail,
  lang,
}: {
  detail: PlayerDetailResponse;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  if (!detail.currentTeam) return null;
  const inner = (
    <>
      <TeamLogo
        name={detail.currentTeam.name}
        logo={detail.currentTeam.logo ?? null}
        size={48}
      />
      <div className="player-current-team-body">
        <span className="player-current-team-label">{t("Mevcut Takım", "Current Team")}</span>
        <span className="player-current-team-name">{detail.currentTeam.name}</span>
      </div>
    </>
  );
  return (
    <section className="match-card player-current-team-card">
      {detail.currentTeam.slug ? (
        <Link href={teamPath(lang, detail.currentTeam.slug)} className="player-current-team-row">
          {inner}
        </Link>
      ) : (
        <div className="player-current-team-row">{inner}</div>
      )}
    </section>
  );
}

function LastTransferRow({ t: row, lang }: { t: PlayerTransferRow; lang: "tr" | "en" }) {
  const tt = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const from = row.fromTeam?.name ?? "—";
  const to = row.toTeam?.name ?? "—";
  return (
    <div className="player-overview-transfer">
      <span className="player-overview-transfer-from">{from}</span>
      <span className="player-overview-transfer-arrow"><IconSwap s={14} /></span>
      <span className="player-overview-transfer-to">{to}</span>
      <span className="player-overview-transfer-date tnum">
        {formatDate(row.date, lang)}
      </span>
      {row.typeText ?? row.type ? (
        <span className="player-overview-transfer-type">{row.typeText ?? row.type}</span>
      ) : null}
      {/* tt sadece i18n-ready */}
      <span className="sr-only">{tt("transfer", "transfer")}</span>
    </div>
  );
}

function LastSideRow({ row, lang }: { row: PlayerSidelinedRow; lang: "tr" | "en" }) {
  return (
    <div className="player-overview-side">
      <IconMed s={14} />
      <span className="player-overview-side-type">{row.typeText ?? row.type ?? "—"}</span>
      <span className="player-overview-side-date tnum">
        {formatDate(row.start, lang)}
        {row.end ? ` → ${formatDate(row.end, lang)}` : ""}
      </span>
    </div>
  );
}

export function PlayerOverviewTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const stats = detail.seasonStats ?? [];
  const lastTransfers = (detail.transfers ?? []).slice(0, 3);
  const lastSidelined = (detail.sidelined ?? []).slice(0, 5);

  return (
    <div className="match-tab player-tab-overview">
      <CurrentTeamCard detail={detail} lang={lang} />

      {stats.length > 0 ? <SeasonTotalsCard stats={stats} lang={lang} /> : null}

      {lastTransfers.length > 0 ? (
        <section className="match-card">
          <header className="match-card-head">
            <h2>
              <IconSwap s={14} /> {t("Son Transferler", "Recent Transfers")}
            </h2>
          </header>
          <div className="player-overview-list">
            {lastTransfers.map((r, i) => (
              <LastTransferRow key={i} t={r} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}

      {lastSidelined.length > 0 ? (
        <section className="match-card">
          <header className="match-card-head">
            <h2>
              <IconMed s={14} /> {t("Son Sakatlıklar", "Recent Injuries")}
            </h2>
          </header>
          <div className="player-overview-list">
            {lastSidelined.map((r, i) => (
              <LastSideRow key={i} row={r} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}

    </div>
  );
}
