"use client";

import Link from "next/link";
import { MatchRow } from "@/components/home/MatchRow";
import { leaguePath } from "@/lib/routes";
import {
  IconTrophy,
  IconBall,
  IconLineup,
  IconMed,
} from "@/components/icons";
import type {
  TeamDetailResponse,
  TeamStandingsPosition,
  TeamCoachInfo,
  TeamSidelinedRow,
} from "@/lib/team-detail-types";

interface Props {
  detail: TeamDetailResponse;
  lang: "tr" | "en";
}

// ─────────────────────────────────────────────────────────────────────
// Form helpers
// ─────────────────────────────────────────────────────────────────────

function FormPills({ form, lang }: { form: string; lang: "tr" | "en" }) {
  // En son 5 mac.
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

// ─────────────────────────────────────────────────────────────────────
// Sub-cards
// ─────────────────────────────────────────────────────────────────────

function StandingsPositionCard({
  pos,
  lang,
}: {
  pos: TeamStandingsPosition;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const inner = (
    <>
      <div className="team-pos-icon">
        {pos.leagueLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pos.leagueLogo} alt={pos.leagueName ?? ""} loading="lazy" />
        ) : (
          <IconTrophy s={20} />
        )}
      </div>
      <div className="team-pos-body">
        <div className="team-pos-league" title={pos.leagueName ?? ""}>
          {pos.leagueName}
        </div>
        <div className="team-pos-meta">
          {pos.groupNameText || pos.groupName ? (
            <span className="team-pos-group">
              {pos.groupNameText ?? pos.groupName}
            </span>
          ) : null}
          {pos.descriptionText ? (
            <span className="team-pos-desc" title={pos.descriptionText}>
              {pos.descriptionText}
            </span>
          ) : null}
        </div>
        {pos.form ? (
          <div className="team-pos-formline">
            <FormPills form={pos.form} lang={lang} />
            <span className="team-pos-record tnum">
              {pos.win ?? 0}G {pos.draw ?? 0}B {pos.lose ?? 0}M
            </span>
          </div>
        ) : null}
      </div>
      <div className="team-pos-stats">
        <span className="team-pos-rank tnum">
          {pos.rank != null ? `${pos.rank}.` : "—"}
        </span>
        <span className="team-pos-points tnum">
          {pos.points ?? 0} {t("Puan", "Pts")}
        </span>
      </div>
    </>
  );
  if (pos.leagueSlug) {
    return (
      <Link href={leaguePath(lang, pos.leagueSlug)} className="team-pos-card">
        {inner}
      </Link>
    );
  }
  return <div className="team-pos-card">{inner}</div>;
}

function CoachCard({
  coach,
  lang,
}: {
  coach: TeamCoachInfo;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const photo = coach.photo
    ?? (coach.coachId
      ? `https://media.api-sports.io/football/coachs/${coach.coachId}.png`
      : null);
  return (
    <div className="team-coach-card">
      <div className="team-coach-photo">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={coach.name ?? ""} loading="lazy" />
        ) : (
          <IconLineup s={28} />
        )}
      </div>
      <div className="team-coach-body">
        <div className="team-coach-name">{coach.name ?? "—"}</div>
        <div className="team-coach-meta">
          {coach.age != null ? (
            <span>
              {coach.age} {t("yaş", "y/o")}
            </span>
          ) : null}
          {coach.nationality ? <span>{coach.nationality}</span> : null}
        </div>
      </div>
      {coach.trophies && coach.trophies.length > 0 ? (
        <div className="team-coach-trophies" title={t("Kupa Sayısı", "Trophy Count")}>
          <IconTrophy s={14} />
          <span className="tnum">{coach.trophies.length}</span>
        </div>
      ) : null}
    </div>
  );
}

function SidelinedRow({ row, lang }: { row: TeamSidelinedRow; lang: "tr" | "en" }) {
  const photo = row.playerPhoto
    ?? (row.playerId
      ? `https://media.api-sports.io/football/players/${row.playerId}.png`
      : null);
  const reason = row.typeText ?? row.type ?? (lang === "tr" ? "Sakat" : "Injured");
  return (
    <div className="team-side-row">
      <div className="team-side-photo">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={row.playerName ?? ""} loading="lazy" />
        ) : (
          <IconMed s={16} />
        )}
      </div>
      <div className="team-side-body">
        <div className="team-side-name">{row.playerName ?? "—"}</div>
        <div className="team-side-reason">{reason}</div>
      </div>
      <span className="team-side-badge">INJ</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────

export function TeamOverviewTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const recent = (detail.recentFixtures ?? []).slice(0, 5);
  const nextMatch = (detail.upcomingFixtures ?? [])[0] ?? null;
  const hasPositions = detail.standingsPositions && detail.standingsPositions.length > 0;
  const hasCoach = !!detail.currentCoach && !!detail.currentCoach.name;
  const sidelined = detail.sidelined ?? [];

  return (
    <div className="match-tab team-tab-overview">
      {/* Sıradaki maç (en üstte) */}
      {nextMatch ? (
        <section className="match-card">
          <header className="match-card-head">
            <h2>
              <IconBall s={14} /> {t("Sıradaki Maç", "Next Match")}
            </h2>
          </header>
          <div className="team-fix-list">
            <MatchRow fixture={nextMatch} />
          </div>
        </section>
      ) : null}

      {/* Lig sıralaması — her lig için ayrı kart */}
      {hasPositions ? (
        <section className="match-card">
          <header className="match-card-head">
            <h2>
              <IconTrophy s={14} /> {t("Lig Sıralaması", "League Standing")}
            </h2>
          </header>
          <div className="team-pos-grid">
            {detail.standingsPositions.map((p, i) => (
              <StandingsPositionCard key={`${p.leagueId}-${i}`} pos={p} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Son maçlar */}
      {recent.length > 0 ? (
        <section className="match-card">
          <header className="match-card-head">
            <h2>
              <IconBall s={14} /> {t("Son Maçlar", "Recent Matches")}
            </h2>
          </header>
          <div className="team-fix-list">
            {recent.map((f) => (
              <MatchRow key={f.id} fixture={f} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Koç */}
      {hasCoach ? (
        <section className="match-card">
          <header className="match-card-head">
            <h2>
              <IconLineup s={14} /> {t("Teknik Direktör", "Head Coach")}
            </h2>
          </header>
          <CoachCard coach={detail.currentCoach!} lang={lang} />
          {detail.currentCoach!.trophies && detail.currentCoach!.trophies.length > 0 ? (
            <ul className="team-trophy-list">
              {detail.currentCoach!.trophies.slice(0, 6).map((tr, i) => (
                <li key={i} className="team-trophy-item">
                  <span className="team-trophy-place">
                    {tr.placeText ?? tr.place ?? "—"}
                  </span>
                  <span className="team-trophy-name">
                    {tr.leagueText ?? tr.league ?? "—"}
                  </span>
                  <span className="team-trophy-country">
                    {tr.countryText ?? tr.country ?? ""}
                  </span>
                  <span className="team-trophy-season tnum">{tr.season ?? ""}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {/* Sakat/cezalı */}
      {sidelined.length > 0 ? (
        <section className="match-card">
          <header className="match-card-head">
            <h2>
              <IconMed s={14} /> {t("Sakat / Cezalı", "Sidelined")}
            </h2>
          </header>
          <div className="team-side-list">
            {sidelined.map((r, i) => (
              <SidelinedRow
                key={`${r.playerId ?? "_"}-${i}`}
                row={r}
                lang={lang}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
