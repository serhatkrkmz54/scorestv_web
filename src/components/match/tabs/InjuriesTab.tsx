"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { teamPath, playerPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import type {
  MatchDetailResponse,
  MatchTeam,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

function resolveTeam(detail: MatchDetailResponse, teamId: number): MatchTeam {
  if (detail.homeTeam.id === teamId) return detail.homeTeam;
  if (detail.awayTeam.id === teamId) return detail.awayTeam;
  return { id: teamId, name: "—", logo: null };
}

export function InjuriesTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const groups = detail.injuries ?? [];

  if (groups.length === 0 || groups.every((g) => !g.players || g.players.length === 0)) {
    return (
      <div className="match-tab match-tab-injuries">
        <section className="match-card">
          <p className="match-empty">
            {t(
              "Bu mac icin sakatlik/cezali bilgisi yok",
              "No injuries or suspensions for this match",
            )}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="match-tab match-tab-injuries">
      {groups.map((g) => {
        if (!g.players || g.players.length === 0) return null;
        const team = resolveTeam(detail, g.teamId);
        const teamHeader = (
          <>
            <TeamLogo name={team.name} logo={team.logo ?? null} size={20} />
            <span>{team.name}</span>
            <span className="injury-count tnum">{g.players.length}</span>
          </>
        );
        return (
          <section key={g.teamId} className="match-card">
            <header className="match-card-head">
              <h3 className="injury-team-head">
                {team.slug ? (
                  <Link href={teamPath(lang, team.slug)} className="injury-team-link">
                    {teamHeader}
                  </Link>
                ) : (
                  teamHeader
                )}
              </h3>
            </header>
            <ul className="injury-list">
              {g.players.map((it, i) => {
                const slug = it.playerId
                  ? buildEntitySlug(it.playerName ?? "", it.playerId)
                  : null;
                const nameCell = (
                  <span className="injury-player-name">{it.playerName ?? "—"}</span>
                );
                return (
                  <li
                    key={(it.playerId ?? it.playerName ?? "p") + "-" + i}
                    className="injury-row"
                  >
                    {slug ? (
                      <Link
                        href={playerPath(lang, slug)}
                        className="injury-player-link"
                      >
                        {nameCell}
                      </Link>
                    ) : (
                      nameCell
                    )}
                    <span className="injury-reason">
                      {it.reasonText ?? it.reason ?? ""}
                    </span>
                    <span className="injury-type">
                      {it.typeText ?? it.type ?? ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
