"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { teamPath, volleyballMatchPath } from "@/lib/routes";
import { formatDate } from "@/lib/match-format";
import type {
  VolleyballGameDetailResponse,
  VolleyballH2hGameView,
  VolleyballTeamRef,
} from "@/lib/volleyball-detail-types";

interface Props {
  detail: VolleyballGameDetailResponse;
  lang: "tr" | "en";
}

const FINISHED = new Set(["FT", "AW"]);

function TeamCell({
  team,
  side,
  isWinner,
  lang,
}: {
  team: VolleyballTeamRef;
  side: "home" | "away";
  isWinner: boolean;
  lang: "tr" | "en";
}) {
  const cls = `h2h-team h2h-team-${side}${isWinner ? " is-winner" : ""}`;
  const name = <span className="h2h-team-name">{team.displayName ?? team.name}</span>;
  const logo = <TeamLogo name={team.name} logo={team.logo ?? null} size={20} />;
  const inner = side === "home" ? (<>{name}{logo}</>) : (<>{logo}{name}</>);
  if (team.slug) {
    return (
      <Link href={teamPath(lang, team.slug)} className={cls} onClick={(e) => e.stopPropagation()}>
        {inner}
      </Link>
    );
  }
  return <span className={cls}>{inner}</span>;
}

export function VolleyballH2HTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const list: VolleyballH2hGameView[] = detail.headToHead ?? [];

  if (list.length === 0) {
    return (
      <div className="match-tab match-tab-h2h">
        <section className="match-card">
          <p className="match-empty">
            {t("İki takım arasında geçmiş karşılaşma yok", "No previous meetings")}
          </p>
        </section>
      </div>
    );
  }

  let homeWins = 0;
  let awayWins = 0;
  const homeId = detail.homeTeam.id;
  const awayId = detail.awayTeam.id;
  for (const f of list) {
    if (!FINISHED.has(f.statusShort ?? "")) continue;
    const hHigher = (f.homeSets ?? 0) > (f.awaySets ?? 0);
    const winnerTeamId = hHigher ? f.homeTeam.id : f.awayTeam.id;
    if (winnerTeamId === homeId) homeWins++;
    else if (winnerTeamId === awayId) awayWins++;
  }
  const total = homeWins + awayWins;
  const pct = (n: number) => (total === 0 ? 50 : (n / total) * 100);

  return (
    <div className="match-tab match-tab-h2h">
      <section className="match-card">
        <header className="match-card-head">
          <h2>{t("Genel Karne", "Head-to-Head")}</h2>
        </header>
        <div className="h2h-summary">
          <div className="h2h-summary-cells">
            <div className="h2h-summary-cell">
              <TeamLogo name={detail.homeTeam.name} logo={detail.homeTeam.logo ?? null} size={24} />
              <span className="h2h-summary-team">{detail.homeTeam.displayName ?? detail.homeTeam.name}</span>
              <span className="h2h-summary-num tnum">{homeWins}</span>
              <span className="h2h-summary-label">{t("Galibiyet", "Wins")}</span>
            </div>
            <div className="h2h-summary-cell">
              <TeamLogo name={detail.awayTeam.name} logo={detail.awayTeam.logo ?? null} size={24} />
              <span className="h2h-summary-team">{detail.awayTeam.displayName ?? detail.awayTeam.name}</span>
              <span className="h2h-summary-num tnum">{awayWins}</span>
              <span className="h2h-summary-label">{t("Galibiyet", "Wins")}</span>
            </div>
          </div>
          <div className="h2h-tally-bar">
            <span className="h2h-tally-seg is-home" style={{ width: `${pct(homeWins)}%` }} />
            <span className="h2h-tally-seg is-away" style={{ width: `${pct(awayWins)}%` }} />
          </div>
        </div>
      </section>

      <section className="match-card">
        <header className="match-card-head">
          <h2>{t("Geçmiş Maçlar", "Past Meetings")}</h2>
        </header>
        <ul className="h2h-list">
          {list.map((f) => {
            const h = f.homeSets ?? 0;
            const a = f.awaySets ?? 0;
            const isFinished = FINISHED.has(f.statusShort ?? "");
            const winnerId = !isFinished ? null : h > a ? f.homeTeam.id : f.awayTeam.id;
            const href = f.slug ? volleyballMatchPath(lang, f.slug) : null;
            const center = (
              <>
                <span className="h2h-meta">
                  <span className="h2h-date">{formatDate(f.kickoff, lang)}</span>
                </span>
                <span className="h2h-score tnum">
                  {isFinished ? `${h} - ${a}` : f.statusText ?? f.statusShort}
                </span>
              </>
            );
            return (
              <li key={f.id} className="h2h-row">
                <TeamCell team={f.homeTeam} side="home" isWinner={winnerId === f.homeTeam.id} lang={lang} />
                {href ? (
                  <Link href={href} className="h2h-center-link">{center}</Link>
                ) : (
                  <div className="h2h-center-link">{center}</div>
                )}
                <TeamCell team={f.awayTeam} side="away" isWinner={winnerId === f.awayTeam.id} lang={lang} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
