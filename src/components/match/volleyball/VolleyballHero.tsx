"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { CountryFlag } from "@/components/shell/CountryFlag";
import { MatchCountdown } from "../MatchCountdown";
import { leaguePath } from "@/lib/routes";
import type {
  VolleyballGameDetailResponse,
  VolleyballScoreBreakdown,
  VolleyballStatus,
} from "@/lib/volleyball-detail-types";

interface Props {
  detail: VolleyballGameDetailResponse;
  lang: "tr" | "en";
}

const LIVE = new Set(["S1", "S2", "S3", "S4", "S5", "LIVE"]);
const FINISHED = new Set(["FT", "AW"]);

function isLive(s: VolleyballStatus): boolean {
  return LIVE.has(s.shortName ?? "");
}

function formatKickoff(iso: string, lang: "tr" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function statusText(s: VolleyballStatus, kickoff: string, lang: "tr" | "en"): string {
  if (isLive(s)) return s.statusText ?? s.longName ?? s.shortName ?? "";
  const code = s.shortName ?? "";
  if (code === "NS" || code === "" || code === "TBD") return formatKickoff(kickoff, lang);
  return s.statusText ?? s.longName ?? code;
}

// Set seridi: S1-S5, her set icin home-away sayilar.
function SetStrip({ score }: { score: VolleyballScoreBreakdown | null }) {
  const sets = score?.sets ?? [];
  if (sets.length === 0) return null;
  return (
    <div className="sport-hero-breakdown" aria-label="Set skorları">
      {sets.map((st, i) => (
        <span key={i} className="sport-hero-period">
          <span className="sport-hero-period-label">{`S${st.setNumber ?? i + 1}`}</span>
          <span className="sport-hero-period-value tnum">{`${st.home ?? 0}-${st.away ?? 0}`}</span>
        </span>
      ))}
    </div>
  );
}

export function VolleyballHero({ detail, lang }: Props) {
  const { homeTeam, awayTeam, score, status, league, kickoff } = detail;
  const live = isLive(status);
  const finished = FINISHED.has(status.shortName ?? "");
  const showScore =
    (live || finished) && score?.homeSets != null && score?.awaySets != null;
  const text = statusText(status, kickoff, lang);
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  return (
    <section className="match-hero">
      <div className="match-hero-bg" aria-hidden>
        {league.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={league.logo} alt={league.name} className="match-hero-bg-logo" />
        ) : null}
        <div className="match-hero-bg-gradient" />
      </div>

      <div className="match-hero-content">
        <div className="match-hero-meta">
          <Link
            href={leaguePath(lang, league.slug ?? String(league.id))}
            className="match-hero-league"
          >
            {league.countryFlag || league.countryName ? (
              <CountryFlag
                flag={league.countryFlag ?? null}
                country={league.countryName ?? ""}
                size={14}
              />
            ) : null}
            <span className="match-hero-league-name">{league.name}</span>
          </Link>
          {detail.stage ? <span className="match-hero-round">{detail.stage}</span> : null}
        </div>

        <div className="match-hero-main">
          <div className="match-hero-team match-hero-team-home">
            <TeamLogo name={homeTeam.name} logo={homeTeam.logo ?? null} size={64} />
            <span className="match-hero-team-name">
              {homeTeam.displayName ?? homeTeam.name}
            </span>
          </div>

          <div className="match-hero-center">
            {live ? (
              <div className="match-hero-live">
                <span className="match-hero-pulse" aria-hidden />
                <span className="match-hero-live-text">{text}</span>
              </div>
            ) : (
              <div className="match-hero-status">{text}</div>
            )}

            {showScore ? (
              <div
                className={`match-hero-score tnum ${live ? "is-live" : ""}`}
                aria-live="polite"
              >
                <span>{score!.homeSets}</span>
                <span className="match-hero-score-sep">-</span>
                <span>{score!.awaySets}</span>
              </div>
            ) : (
              <MatchCountdown
                kickoff={kickoff}
                lang={lang}
                fallback={<div className="match-hero-vs">{t("vs", "vs")}</div>}
              />
            )}

            <SetStrip score={score} />
          </div>

          <div className="match-hero-team match-hero-team-away">
            <TeamLogo name={awayTeam.name} logo={awayTeam.logo ?? null} size={64} />
            <span className="match-hero-team-name">
              {awayTeam.displayName ?? awayTeam.name}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
