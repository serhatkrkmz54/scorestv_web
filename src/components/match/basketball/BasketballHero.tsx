"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { CountryFlag } from "@/components/shell/CountryFlag";
import { leaguePath, basketballTeamPath } from "@/lib/routes";
import { MatchCountdown } from "../MatchCountdown";
import { buildEntitySlug } from "@/lib/slug-utils";
import type {
  BasketballGameDetailResponse,
  BasketballScoreBreakdown,
  BasketballStatus,
} from "@/lib/basketball-detail-types";

interface Props {
  detail: BasketballGameDetailResponse;
  lang: "tr" | "en";
}

const LIVE = new Set(["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT", "LIVE"]);
const FINISHED = new Set(["FT", "AOT"]);

function isLive(s: BasketballStatus): boolean {
  return LIVE.has(s.shortName ?? "");
}

function formatKickoff(iso: string, lang: "tr" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function statusText(s: BasketballStatus, kickoff: string, lang: "tr" | "en"): string {
  if (isLive(s)) {
    if (s.timer) return s.timer;
    return s.statusText ?? s.longName ?? "";
  }
  const code = s.shortName ?? "";
  if (code === "NS" || code === "" || code === "TBD") return formatKickoff(kickoff, lang);
  return s.statusText ?? s.longName ?? code;
}

// Ceyrek seridi: Ç1-Ç4 + UZT.
function QuarterStrip({
  score,
  lang,
}: {
  score: BasketballScoreBreakdown | null;
  lang: "tr" | "en";
}) {
  if (!score?.home && !score?.away) return null;
  const labels = lang === "tr" ? ["Ç1", "Ç2", "Ç3", "Ç4", "UZT"] : ["Q1", "Q2", "Q3", "Q4", "OT"];
  const h = score.home;
  const a = score.away;
  const hv = [h?.q1, h?.q2, h?.q3, h?.q4, h?.overTime];
  const av = [a?.q1, a?.q2, a?.q3, a?.q4, a?.overTime];

  const items: { label: string; value: string }[] = [];
  for (let i = 0; i < labels.length; i++) {
    if (hv[i] != null || av[i] != null) {
      items.push({ label: labels[i], value: `${hv[i] ?? 0}-${av[i] ?? 0}` });
    }
  }
  if (items.length === 0) return null;

  return (
    <div className="sport-hero-breakdown" aria-label="Çeyrek skorları">
      {items.map((it, i) => (
        <span key={i} className="sport-hero-period">
          <span className="sport-hero-period-label">{it.label}</span>
          <span className="sport-hero-period-value tnum">{it.value}</span>
        </span>
      ))}
    </div>
  );
}

export function BasketballHero({ detail, lang }: Props) {
  const { homeTeam, awayTeam, score, status, league, kickoff } = detail;
  const live = isLive(status);
  const finished = FINISHED.has(status.shortName ?? "");
  const showScore =
    (live || finished) && score?.home?.total != null && score?.away?.total != null;
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
          <Link
            href={basketballTeamPath(lang, homeTeam.slug ?? buildEntitySlug(homeTeam.name, homeTeam.id))}
            className="match-hero-team match-hero-team-home"
          >
            <TeamLogo name={homeTeam.name} logo={homeTeam.logo ?? null} size={64} />
            <span className="match-hero-team-name">
              {homeTeam.displayName ?? homeTeam.name}
            </span>
          </Link>

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
                <span>{score!.home!.total}</span>
                <span className="match-hero-score-sep">-</span>
                <span>{score!.away!.total}</span>
              </div>
            ) : (
              <MatchCountdown
                kickoff={kickoff}
                lang={lang}
                fallback={<div className="match-hero-vs">{t("vs", "vs")}</div>}
              />
            )}

            <QuarterStrip score={score} lang={lang} />
          </div>

          <Link
            href={basketballTeamPath(lang, awayTeam.slug ?? buildEntitySlug(awayTeam.name, awayTeam.id))}
            className="match-hero-team match-hero-team-away"
          >
            <TeamLogo name={awayTeam.name} logo={awayTeam.logo ?? null} size={64} />
            <span className="match-hero-team-name">
              {awayTeam.displayName ?? awayTeam.name}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
