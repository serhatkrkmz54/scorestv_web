"use client";

import Link from "next/link";
import { teamPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconLineup } from "@/components/icons";
import type {
  PlayerDetailResponse,
  PlayerCareerTeamView,
} from "@/lib/player-detail-types";

interface Props {
  detail: PlayerDetailResponse;
  lang: "tr" | "en";
}

function CareerRow({
  entry,
  lang,
}: {
  entry: PlayerCareerTeamView;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const seasons = (entry.seasons ?? []).slice().sort((a, b) => b - a);
  const first = seasons[seasons.length - 1];
  const last = seasons[0];
  const range = first === last ? `${first}` : `${first}—${last}`;
  const inner = (
    <>
      <TeamLogo name={entry.team.name} logo={entry.team.logo ?? null} size={36} />
      <div className="player-career-body">
        <span className="player-career-team">{entry.team.name}</span>
        <span className="player-career-range tnum">
          {range} · {seasons.length} {t("sezon", "season(s)")}
        </span>
      </div>
      <div className="player-career-chips">
        {seasons.slice(0, 6).map((y) => (
          <span key={y} className="player-career-chip tnum">{y}</span>
        ))}
        {seasons.length > 6 ? (
          <span className="player-career-chip is-more tnum">+{seasons.length - 6}</span>
        ) : null}
      </div>
    </>
  );
  if (entry.team.slug) {
    return (
      <Link href={teamPath(lang, entry.team.slug)} className="player-career-row">
        {inner}
      </Link>
    );
  }
  return <div className="player-career-row">{inner}</div>;
}

export function PlayerCareerTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const career = detail.careerTeams ?? [];
  if (career.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Kariyer bilgisi yok", "No career data")}</p>
        </section>
      </div>
    );
  }
  // Yeni → eski: en yeni sezona sahip takim once.
  const sorted = [...career].sort((a, b) => {
    const am = Math.max(...(a.seasons ?? [0]));
    const bm = Math.max(...(b.seasons ?? [0]));
    return bm - am;
  });
  return (
    <div className="match-tab player-tab-career">
      <section className="match-card">
        <header className="match-card-head">
          <h3>
            <IconLineup s={14} /> {t("Kariyer Takımları", "Career Teams")}
            <span className="team-squad-count tnum">{career.length}</span>
          </h3>
        </header>
        <div className="player-career-list">
          {sorted.map((c, i) => (
            <CareerRow key={`${c.team.id}-${i}`} entry={c} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  );
}
