"use client";

import Link from "next/link";
import { leaguePath } from "@/lib/routes";
import { IconTrophy } from "@/components/icons";
import type {
  TeamDetailResponse,
  TeamStandingsPosition,
} from "@/lib/team-detail-types";

interface Props {
  detail: TeamDetailResponse;
  lang: "tr" | "en";
}

function FormPills({ form, lang }: { form: string; lang: "tr" | "en" }) {
  const letters = form.slice(-5).split("");
  return (
    <span className="standings-form team-form-pills">
      {letters.map((l, i) => {
        const cls =
          l === "W" ? "is-w" : l === "L" ? "is-l" : l === "D" ? "is-d" : "is-n";
        const display = lang === "tr"
          ? (l === "W" ? "G" : l === "D" ? "B" : l === "L" ? "M" : l)
          : l;
        return (
          <span key={i} className={`form-pill ${cls}`} title={l}>
            {display}
          </span>
        );
      })}
    </span>
  );
}

function PositionDetailCard({
  pos,
  lang,
}: {
  pos: TeamStandingsPosition;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const inner = (
    <>
      <header className="team-stand-head">
        <div className="team-stand-league">
          {pos.leagueLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pos.leagueLogo}
              alt=""
              className="team-stand-league-logo"
              loading="lazy"
            />
          ) : (
            <IconTrophy s={20} />
          )}
          <div className="team-stand-league-text">
            <span className="team-stand-league-name" title={pos.leagueName ?? ""}>
              {pos.leagueName}
            </span>
            {pos.groupNameText || pos.groupName ? (
              <span className="team-stand-group">
                {pos.groupNameText ?? pos.groupName}
              </span>
            ) : null}
          </div>
        </div>
        <div className="team-stand-rank-bigbox">
          <span className="team-stand-rank tnum">
            {pos.rank != null ? pos.rank : "—"}
          </span>
          <span className="team-stand-rank-label">{t(".sıra", "rank")}</span>
        </div>
      </header>

      {pos.descriptionText ? (
        <div className="team-stand-desc">{pos.descriptionText}</div>
      ) : null}

      <div className="team-stand-stats">
        <div className="team-stand-stat">
          <span className="team-stand-stat-val tnum">{pos.points ?? 0}</span>
          <span className="team-stand-stat-lbl">{t("Puan", "Pts")}</span>
        </div>
        <div className="team-stand-stat">
          <span className="team-stand-stat-val tnum">{pos.played ?? 0}</span>
          <span className="team-stand-stat-lbl">{t("Oynanan", "Played")}</span>
        </div>
        <div className="team-stand-stat is-w">
          <span className="team-stand-stat-val tnum">{pos.win ?? 0}</span>
          <span className="team-stand-stat-lbl">{t("G", "W")}</span>
        </div>
        <div className="team-stand-stat is-d">
          <span className="team-stand-stat-val tnum">{pos.draw ?? 0}</span>
          <span className="team-stand-stat-lbl">{t("B", "D")}</span>
        </div>
        <div className="team-stand-stat is-l">
          <span className="team-stand-stat-val tnum">{pos.lose ?? 0}</span>
          <span className="team-stand-stat-lbl">{t("M", "L")}</span>
        </div>
        <div className="team-stand-stat">
          <span className="team-stand-stat-val tnum">
            {pos.goalsDiff != null
              ? (pos.goalsDiff > 0 ? `+${pos.goalsDiff}` : `${pos.goalsDiff}`)
              : "—"}
          </span>
          <span className="team-stand-stat-lbl">{t("AVG", "GD")}</span>
        </div>
      </div>

      {pos.form ? (
        <div className="team-stand-formline">
          <span className="team-stand-form-label">{t("Form", "Form")}</span>
          <FormPills form={pos.form} lang={lang} />
        </div>
      ) : null}
    </>
  );

  if (pos.leagueSlug) {
    return (
      <Link href={leaguePath(lang, pos.leagueSlug)} className="match-card team-stand-card">
        {inner}
      </Link>
    );
  }
  return <div className="match-card team-stand-card">{inner}</div>;
}

export function TeamStandingsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const positions = detail.standingsPositions ?? [];
  if (positions.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Puan durumu yok", "No standings")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab team-tab-standings">
      {positions.map((p, i) => (
        <PositionDetailCard key={`${p.leagueId}-${i}`} pos={p} lang={lang} />
      ))}
    </div>
  );
}
