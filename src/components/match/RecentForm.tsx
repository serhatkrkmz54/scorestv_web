"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { matchPath } from "@/lib/routes";
import type {
  MatchDetailResponse,
  MatchFormItem,
  MatchTeam,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

function shortDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function resultChar(r?: string | null): string {
  if (r === "W") return "✓";
  if (r === "L") return "✕";
  return "○";
}

/** Tek maç satırı — tarih · ev · skor · deplasman · sonuç rozeti. */
function FormRow({
  subject,
  m,
  lang,
}: {
  subject: MatchTeam;
  m: MatchFormItem;
  lang: "tr" | "en";
}) {
  // Özne perspektifinden gerçek ev/deplasmanı yeniden kur.
  const subjHome = m.home;
  const homeName = subjHome ? subject.name : m.opponentName ?? "";
  const awayName = subjHome ? m.opponentName ?? "" : subject.name;
  const homeLogo = subjHome ? subject.logo ?? null : m.opponentLogo ?? null;
  const awayLogo = subjHome ? m.opponentLogo ?? null : subject.logo ?? null;
  const hg = subjHome ? m.goalsFor : m.goalsAgainst;
  const ag = subjHome ? m.goalsAgainst : m.goalsFor;
  const homeWin = (hg ?? 0) > (ag ?? 0);
  const awayWin = (ag ?? 0) > (hg ?? 0);
  const homeRed = subjHome ? m.redFor : m.redAgainst;
  const awayRed = subjHome ? m.redAgainst : m.redFor;
  const res = (m.result ?? "d").toLowerCase();
  const href = m.slug ? matchPath(lang, m.slug) : null;

  const inner = (
    <>
      <span className="mform-left">
        <TeamLogo name={m.leagueName} logo={m.leagueLogo ?? null} size={15} />
        <span className="mform-date">{shortDate(m.kickoff)}</span>
      </span>
      <span className={`mform-team mform-team-home${homeWin ? " is-winner" : ""}`}>
        {homeRed > 0 ? <span className="mform-red" /> : null}
        <span className="mform-name">{homeName}</span>
        <TeamLogo name={homeName} logo={homeLogo} size={18} />
      </span>
      <span className="mform-score tnum">
        {hg ?? "-"} - {ag ?? "-"}
      </span>
      <span className={`mform-team mform-team-away${awayWin ? " is-winner" : ""}`}>
        <TeamLogo name={awayName} logo={awayLogo} size={18} />
        <span className="mform-name">{awayName}</span>
        {awayRed > 0 ? <span className="mform-red" /> : null}
      </span>
      <span className={`mform-badge mform-badge-${res}`}>{resultChar(m.result)}</span>
    </>
  );

  return (
    <li className="mform-row">
      {href ? (
        <Link href={href} className="mform-link">
          {inner}
        </Link>
      ) : (
        <div className="mform-link">{inner}</div>
      )}
    </li>
  );
}

function TeamFormCard({
  subject,
  form,
  title,
  lang,
}: {
  subject: MatchTeam;
  form: MatchFormItem[];
  title: string;
  lang: "tr" | "en";
}) {
  return (
    <section className="match-card">
      <header className="match-card-head mform-head">
        <TeamLogo name={subject.name} logo={subject.logo ?? null} size={20} />
        <h3>
          {subject.name} · {title}
        </h3>
      </header>
      <ul className="mform-list">
        {form.map((m) => (
          <FormRow key={m.fixtureId} subject={subject} m={m} lang={lang} />
        ))}
      </ul>
    </section>
  );
}

/**
 * Son 5 Maç formu — Maçkolik tarzı. Her iki takım için bu maçtan önce
 * oynanmış son 5 maç. Veri yoksa hiç render edilmez.
 */
export function RecentForm({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const home = detail.homeForm ?? [];
  const away = detail.awayForm ?? [];
  if (home.length === 0 && away.length === 0) return null;
  const title = t("Son 5 Maç", "Last 5 Matches");
  return (
    <>
      {home.length > 0 ? (
        <TeamFormCard subject={detail.homeTeam} form={home} title={title} lang={lang} />
      ) : null}
      {away.length > 0 ? (
        <TeamFormCard subject={detail.awayTeam} form={away} title={title} lang={lang} />
      ) : null}
    </>
  );
}
