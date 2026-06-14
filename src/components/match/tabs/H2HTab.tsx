"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { matchPath, teamPath } from "@/lib/routes";
import { formatDate } from "@/lib/match-format";
import type {
  MatchDetailResponse,
  MatchH2hFixture,
  MatchH2hTeam,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

interface Tally {
  home: number;
  draw: number;
  away: number;
}

const FT_STATUSES = new Set(["FT", "AET", "PEN"]);

function computeTally(
  list: MatchH2hFixture[],
  homeId: number,
  awayId: number,
): Tally {
  const t: Tally = { home: 0, draw: 0, away: 0 };
  for (const f of list) {
    if (!FT_STATUSES.has(f.status)) continue;
    const h = f.homeScore ?? 0;
    const a = f.awayScore ?? 0;
    if (h === a) {
      t.draw++;
      continue;
    }
    const winnerId = h > a ? f.homeTeam.id : f.awayTeam.id;
    if (winnerId === homeId) t.home++;
    else if (winnerId === awayId) t.away++;
  }
  return t;
}

function TeamCell({
  team,
  side,
  isWinner,
  lang,
}: {
  team: MatchH2hTeam;
  side: "home" | "away";
  isWinner: boolean;
  lang: "tr" | "en";
}) {
  const cls = `h2h-team h2h-team-${side}${isWinner ? " is-winner" : ""}`;
  const name = <span className="h2h-team-name">{team.name}</span>;
  const logo = (
    <TeamLogo name={team.name} logo={team.logo ?? null} size={20} />
  );
  const inner = side === "home" ? (<>{name}{logo}</>) : (<>{logo}{name}</>);
  if (team.slug) {
    return (
      <Link
        href={teamPath(lang, team.slug)}
        className={cls}
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </Link>
    );
  }
  return <span className={cls}>{inner}</span>;
}

export function H2HTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const list = detail.headToHead ?? [];

  if (list.length === 0) {
    return (
      <div className="match-tab match-tab-h2h">
        <section className="match-card">
          <p className="match-empty">
            {t(
              "Iki takim arasinda gecmis karsilasma bulunamadi",
              "No previous meetings between these teams",
            )}
          </p>
        </section>
      </div>
    );
  }

  const tally = computeTally(list, detail.homeTeam.id, detail.awayTeam.id);
  const total = tally.home + tally.draw + tally.away;
  const pct = (n: number) => (total === 0 ? 33 : (n / total) * 100);

  return (
    <div className="match-tab match-tab-h2h">
      <section className="match-card">
        <header className="match-card-head">
          <h3>{t("Genel Karne", "Head-to-Head")}</h3>
        </header>
        <div className="h2h-summary">
          <div className="h2h-summary-cells">
            <div className="h2h-summary-cell">
              <TeamLogo
                name={detail.homeTeam.name}
                logo={detail.homeTeam.logo ?? null}
                size={24}
              />
              {detail.homeTeam.slug ? (
                <Link
                  href={teamPath(lang, detail.homeTeam.slug)}
                  className="h2h-summary-team"
                >
                  {detail.homeTeam.name}
                </Link>
              ) : (
                <span className="h2h-summary-team">{detail.homeTeam.name}</span>
              )}
              <span className="h2h-summary-num tnum">{tally.home}</span>
              <span className="h2h-summary-label">
                {t("Galibiyet", "Wins")}
              </span>
            </div>
            <div className="h2h-summary-cell h2h-summary-cell-draw">
              <span className="h2h-summary-num tnum">{tally.draw}</span>
              <span className="h2h-summary-label">
                {t("Beraberlik", "Draws")}
              </span>
            </div>
            <div className="h2h-summary-cell">
              <TeamLogo
                name={detail.awayTeam.name}
                logo={detail.awayTeam.logo ?? null}
                size={24}
              />
              {detail.awayTeam.slug ? (
                <Link
                  href={teamPath(lang, detail.awayTeam.slug)}
                  className="h2h-summary-team"
                >
                  {detail.awayTeam.name}
                </Link>
              ) : (
                <span className="h2h-summary-team">{detail.awayTeam.name}</span>
              )}
              <span className="h2h-summary-num tnum">{tally.away}</span>
              <span className="h2h-summary-label">
                {t("Galibiyet", "Wins")}
              </span>
            </div>
          </div>
          <div className="h2h-tally-bar">
            <span className="h2h-tally-seg is-home" style={{ width: `${pct(tally.home)}%` }} />
            <span className="h2h-tally-seg is-draw" style={{ width: `${pct(tally.draw)}%` }} />
            <span className="h2h-tally-seg is-away" style={{ width: `${pct(tally.away)}%` }} />
          </div>
        </div>
      </section>

      <section className="match-card">
        <header className="match-card-head">
          <h3>{t("Gecmis Maclar", "Past Meetings")}</h3>
        </header>
        <ul className="h2h-list">
          {list.map((f) => {
            const h = f.homeScore ?? 0;
            const a = f.awayScore ?? 0;
            const isFinished = FT_STATUSES.has(f.status);
            const winnerId = !isFinished
              ? null
              : h === a
                ? null
                : h > a
                  ? f.homeTeam.id
                  : f.awayTeam.id;
            // Satir wrapper artik Link DEGIL — takim hucreleri ic Link icin
            // div'e cevirildi. Ortadaki (date+league+score) tek Link ile
            // mac sayfasina gider.
            const matchHref = f.slug ? matchPath(lang, f.slug) : null;
            return (
              <li key={f.id} className="h2h-row">
                <TeamCell team={f.homeTeam} side="home" isWinner={winnerId === f.homeTeam.id} lang={lang} />
                {matchHref ? (
                  <Link href={matchHref} className="h2h-center-link">
                    <span className="h2h-meta">
                      <span className="h2h-date">{formatDate(f.kickoff, lang)}</span>
                      {f.league ? (
                        <span className="h2h-league">
                          <TeamLogo name={f.league.name} logo={f.league.logo ?? null} size={12} />
                          <span>{f.league.name}</span>
                        </span>
                      ) : null}
                    </span>
                    <span className="h2h-score tnum">
                      {isFinished ? `${h} - ${a}` : f.statusText ?? f.status}
                    </span>
                  </Link>
                ) : (
                  <div className="h2h-center-link">
                    <span className="h2h-meta">
                      <span className="h2h-date">{formatDate(f.kickoff, lang)}</span>
                      {f.league ? (
                        <span className="h2h-league">
                          <TeamLogo name={f.league.name} logo={f.league.logo ?? null} size={12} />
                          <span>{f.league.name}</span>
                        </span>
                      ) : null}
                    </span>
                    <span className="h2h-score tnum">
                      {isFinished ? `${h} - ${a}` : f.statusText ?? f.status}
                    </span>
                  </div>
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
