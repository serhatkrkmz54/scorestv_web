"use client";

import { useState } from "react";
import Link from "next/link";
import { leaguePath } from "@/lib/routes";
import { IconBars, IconTrophy } from "@/components/icons";
import type {
  TeamDetailResponse,
  TeamStatisticsByLeague,
} from "@/lib/team-detail-types";

interface Props {
  detail: TeamDetailResponse;
  lang: "tr" | "en";
}

// Yardimci: nested JSON path okuyucu (string array). undefined-safe.
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

// Tek bir lig kartı — accordion (expandable) olarak render edilir.
function StatsLeagueAccordion({
  stat,
  lang,
  defaultOpen,
}: {
  stat: TeamStatisticsByLeague;
  lang: "tr" | "en";
  defaultOpen: boolean;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const s = stat.stats ?? {};

  const wins = num(path(s, ["fixtures", "wins", "total"]));
  const draws = num(path(s, ["fixtures", "draws", "total"]));
  const loses = num(path(s, ["fixtures", "loses", "total"]));
  const played = num(path(s, ["fixtures", "played", "total"]));
  const goalsFor = num(path(s, ["goals", "for", "total", "total"]));
  const goalsAg = num(path(s, ["goals", "against", "total", "total"]));
  const cleanSheet = num(path(s, ["clean_sheet", "total"]));
  const failedScore = num(path(s, ["failed_to_score", "total"]));
  const streakWins = num(path(s, ["biggest", "streak", "wins"]));
  const streakDraws = num(path(s, ["biggest", "streak", "draws"]));
  const streakLoses = num(path(s, ["biggest", "streak", "loses"]));
  const penTotal = num(path(s, ["penalty", "total"]));
  const penScored = num(path(s, ["penalty", "scored", "total"]));
  const penMissed = num(path(s, ["penalty", "missed", "total"]));

  const totalRecord = wins + draws + loses;
  const winsPct = totalRecord > 0 ? (wins / totalRecord) * 100 : 0;
  const drawsPct = totalRecord > 0 ? (draws / totalRecord) * 100 : 0;
  const losesPct = totalRecord > 0 ? (loses / totalRecord) * 100 : 0;

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
              alt=""
              className="team-stats-league-logo"
              loading="lazy"
            />
          ) : (
            <IconTrophy s={20} />
          )}
          <span className="team-stats-league-name" title={stat.leagueName ?? ""}>
            {stat.leagueName}
          </span>
        </span>
        <span className="team-stats-acc-summary tnum">
          <span className="team-stats-acc-mini is-w">{wins}G</span>
          <span className="team-stats-acc-mini is-d">{draws}B</span>
          <span className="team-stats-acc-mini is-l">{loses}M</span>
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
            <Link href={leaguePath(lang, stat.leagueSlug)} className="team-stats-league-link team-stats-acc-deeplink">
              {t("Lig sayfasini ac", "Open league page")} →
            </Link>
          ) : null}

          <div className="team-stats-wdl">
            <div className="team-stats-chip is-w">
              <span className="team-stats-chip-val tnum">{wins}</span>
              <span className="team-stats-chip-lbl">{t("Galibiyet", "Wins")}</span>
            </div>
            <div className="team-stats-chip is-d">
              <span className="team-stats-chip-val tnum">{draws}</span>
              <span className="team-stats-chip-lbl">{t("Beraberlik", "Draws")}</span>
            </div>
            <div className="team-stats-chip is-l">
              <span className="team-stats-chip-val tnum">{loses}</span>
              <span className="team-stats-chip-lbl">{t("Maglubiyet", "Loses")}</span>
            </div>
          </div>

          {totalRecord > 0 ? (
            <div className="team-stats-bar" aria-hidden>
              <span className="team-stats-bar-seg is-w" style={{ width: `${winsPct}%` }} />
              <span className="team-stats-bar-seg is-d" style={{ width: `${drawsPct}%` }} />
              <span className="team-stats-bar-seg is-l" style={{ width: `${losesPct}%` }} />
            </div>
          ) : null}

          <dl className="team-stats-rows">
            <div className="team-stats-row">
              <dt>{t("Oynanan", "Played")}</dt>
              <dd className="tnum">{played}</dd>
            </div>
            <div className="team-stats-row">
              <dt>{t("Attigi Gol", "Goals For")}</dt>
              <dd className="tnum">{goalsFor}</dd>
            </div>
            <div className="team-stats-row">
              <dt>{t("Yedigi Gol", "Goals Against")}</dt>
              <dd className="tnum">{goalsAg}</dd>
            </div>
            <div className="team-stats-row">
              <dt>{t("Averaj", "Goal Diff")}</dt>
              <dd className="tnum">
                {goalsFor - goalsAg > 0 ? "+" : ""}
                {goalsFor - goalsAg}
              </dd>
            </div>
            <div className="team-stats-row">
              <dt>{t("Gol Yemedigi Mac", "Clean Sheets")}</dt>
              <dd className="tnum">{cleanSheet}</dd>
            </div>
            <div className="team-stats-row">
              <dt>{t("Gol Atamadigi Mac", "Failed to Score")}</dt>
              <dd className="tnum">{failedScore}</dd>
            </div>
          </dl>

          {penTotal > 0 ? (
            <div className="team-stats-sub">
              <div className="team-stats-sub-head">{t("Penaltilar", "Penalties")}</div>
              <div className="team-stats-sub-grid">
                <div>
                  <span className="team-stats-sub-val tnum">{penTotal}</span>
                  <span className="team-stats-sub-lbl">{t("Toplam", "Total")}</span>
                </div>
                <div>
                  <span className="team-stats-sub-val tnum">{penScored}</span>
                  <span className="team-stats-sub-lbl">{t("Atilan", "Scored")}</span>
                </div>
                <div>
                  <span className="team-stats-sub-val tnum">{penMissed}</span>
                  <span className="team-stats-sub-lbl">{t("Kacirilan", "Missed")}</span>
                </div>
              </div>
            </div>
          ) : null}

          {streakWins + streakDraws + streakLoses > 0 ? (
            <div className="team-stats-sub">
              <div className="team-stats-sub-head">{t("En Uzun Seri", "Longest Streak")}</div>
              <div className="team-stats-sub-grid">
                <div>
                  <span className="team-stats-sub-val tnum is-w">{streakWins}</span>
                  <span className="team-stats-sub-lbl">{t("Galibiyet", "Wins")}</span>
                </div>
                <div>
                  <span className="team-stats-sub-val tnum is-d">{streakDraws}</span>
                  <span className="team-stats-sub-lbl">{t("Beraberlik", "Draws")}</span>
                </div>
                <div>
                  <span className="team-stats-sub-val tnum is-l">{streakLoses}</span>
                  <span className="team-stats-sub-lbl">{t("Maglubiyet", "Loses")}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function TeamStatsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const stats = detail.statistics ?? [];
  if (stats.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Istatistik yok", "No statistics")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab team-tab-stats">
      <div className="team-stats-meta">
        <IconBars s={14} />
        <span>{t("Lig basina detayli istatistikler", "Detailed statistics per league")}</span>
      </div>
      {stats.map((s, i) => (
        <StatsLeagueAccordion
          key={`${s.leagueId}-${i}`}
          stat={s}
          lang={lang}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
