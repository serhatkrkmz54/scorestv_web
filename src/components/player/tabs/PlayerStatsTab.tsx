"use client";

import { useState } from "react";
import Link from "next/link";
import { teamPath, leaguePath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconBars, IconTrophy } from "@/components/icons";
import type {
  PlayerDetailResponse,
  PlayerSeasonStatView,
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

function StatsLeagueAccordion({
  stat,
  lang,
  defaultOpen,
}: {
  stat: PlayerSeasonStatView;
  lang: "tr" | "en";
  defaultOpen: boolean;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const s = stat.stats ?? {};

  const apps = num(path(s, ["games", "appearences"]));
  const lineups = num(path(s, ["games", "lineups"]));
  const minutes = num(path(s, ["games", "minutes"]));
  const rating = path<unknown>(s, ["games", "rating"]);
  const ratingStr = rating == null ? "—" : String(rating);
  const goals = num(path(s, ["goals", "total"]));
  const assists = num(path(s, ["goals", "assists"]));
  const conceded = num(path(s, ["goals", "conceded"]));
  const saves = num(path(s, ["goals", "saves"]));
  const shotsTotal = num(path(s, ["shots", "total"]));
  const shotsOn = num(path(s, ["shots", "on"]));
  const passesTotal = num(path(s, ["passes", "total"]));
  const passesKey = num(path(s, ["passes", "key"]));
  const passesAcc = path<unknown>(s, ["passes", "accuracy"]);
  const tackles = num(path(s, ["tackles", "total"]));
  const blocks = num(path(s, ["tackles", "blocks"]));
  const intercepts = num(path(s, ["tackles", "interceptions"]));
  const drbAtt = num(path(s, ["dribbles", "attempts"]));
  const drbSucc = num(path(s, ["dribbles", "success"]));
  const yellow = num(path(s, ["cards", "yellow"]));
  const yellowRed = num(path(s, ["cards", "yellowred"]));
  const red = num(path(s, ["cards", "red"]));

  return (
    <section className={`match-card team-stats-card team-stats-acc ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="team-stats-acc-head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="team-stats-acc-league">
          {stat.leagueLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={stat.leagueLogo}
              alt={stat.leagueName ?? ""}
              className="team-stats-league-logo"
              loading="lazy"
            />
          ) : (
            <IconTrophy s={20} />
          )}
          <span className="team-stats-league-name" title={stat.leagueName ?? ""}>
            {stat.leagueName}
          </span>
          {stat.teamName ? (
            <span className="player-stats-team">
              <TeamLogo name={stat.teamName} logo={stat.teamLogo ?? null} size={14} />
              <span>{stat.teamName}</span>
            </span>
          ) : null}
        </span>
        <span className="team-stats-acc-summary tnum">
          <span className="team-stats-acc-mini is-w">{goals}{t("G", "G")}</span>
          <span className="team-stats-acc-mini is-d">{assists}{t("A", "A")}</span>
          <span className="team-stats-acc-mini is-l">{apps}{t("M", "M")}</span>
        </span>
        <span className="team-stats-acc-caret" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="team-stats-acc-body">
          {stat.leagueSlug ? (
            <Link href={leaguePath(lang, stat.leagueSlug)} className="team-stats-acc-deeplink">
              {t("Lig sayfasını aç", "Open league page")} →
            </Link>
          ) : null}
          {stat.teamSlug ? (
            <Link href={teamPath(lang, stat.teamSlug)} className="team-stats-acc-deeplink">
              {t("Takım sayfasını aç", "Open team page")} →
            </Link>
          ) : null}

          <div className="team-stats-wdl">
            <div className="team-stats-chip is-w">
              <span className="team-stats-chip-val tnum">{goals}</span>
              <span className="team-stats-chip-lbl">{t("Gol", "Goals")}</span>
            </div>
            <div className="team-stats-chip is-d">
              <span className="team-stats-chip-val tnum">{assists}</span>
              <span className="team-stats-chip-lbl">{t("Asist", "Assists")}</span>
            </div>
            <div className="team-stats-chip is-l">
              <span className="team-stats-chip-val tnum">{apps}</span>
              <span className="team-stats-chip-lbl">{t("Maç", "Apps")}</span>
            </div>
          </div>

          <dl className="team-stats-rows">
            <div className="team-stats-row"><dt>{t("İlk 11", "Lineups")}</dt><dd className="tnum">{lineups}</dd></div>
            <div className="team-stats-row"><dt>{t("Dakika", "Minutes")}</dt><dd className="tnum">{minutes}</dd></div>
            <div className="team-stats-row"><dt>{t("Rating", "Rating")}</dt><dd className="tnum">{ratingStr}</dd></div>
            <div className="team-stats-row"><dt>{t("Şut (İsabetli)", "Shots (On)")}</dt><dd className="tnum">{shotsTotal} ({shotsOn})</dd></div>
            <div className="team-stats-row"><dt>{t("Pas (Anahtar)", "Passes (Key)")}</dt><dd className="tnum">{passesTotal} ({passesKey})</dd></div>
            {passesAcc != null ? (
              <div className="team-stats-row"><dt>{t("Pas Isabet", "Pass Accuracy")}</dt><dd className="tnum">{String(passesAcc)}%</dd></div>
            ) : null}
            <div className="team-stats-row"><dt>{t("Müdahale", "Tackles")}</dt><dd className="tnum">{tackles}</dd></div>
            <div className="team-stats-row"><dt>{t("Blok", "Blocks")}</dt><dd className="tnum">{blocks}</dd></div>
            <div className="team-stats-row"><dt>{t("Pas Arası", "Interceptions")}</dt><dd className="tnum">{intercepts}</dd></div>
            <div className="team-stats-row"><dt>{t("Top Sürme Den/Bas", "Dribbles Att/OK")}</dt><dd className="tnum">{drbAtt} / {drbSucc}</dd></div>
            <div className="team-stats-row"><dt>{t("Sarı Kart", "Yellow Cards")}</dt><dd className="tnum">{yellow}{yellowRed > 0 ? ` (${yellowRed} 2nd)` : ""}</dd></div>
            <div className="team-stats-row"><dt>{t("Kırmızı Kart", "Red Cards")}</dt><dd className="tnum">{red}</dd></div>
            {conceded > 0 || saves > 0 ? (
              <>
                <div className="team-stats-row"><dt>{t("Yediği Gol", "Conceded")}</dt><dd className="tnum">{conceded}</dd></div>
                <div className="team-stats-row"><dt>{t("Kurtarış", "Saves")}</dt><dd className="tnum">{saves}</dd></div>
              </>
            ) : null}
          </dl>
        </div>
      ) : null}
    </section>
  );
}

export function PlayerStatsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const stats = detail.seasonStats ?? [];
  if (stats.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("İstatistik yok", "No statistics")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab player-tab-stats">
      <div className="team-stats-meta">
        <IconBars s={14} />
        <span>{t("Turnuva başına sezon istatistikleri", "Per-tournament season stats")}</span>
      </div>
      {stats.map((s, i) => (
        <StatsLeagueAccordion
          key={`${s.leagueId ?? "_"}-${s.teamId ?? "_"}-${i}`}
          stat={s}
          lang={lang}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
