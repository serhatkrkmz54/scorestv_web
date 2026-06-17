"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { matchPath, teamPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import type { FixtureSummary, FixtureTeam } from "@/lib/fixtures-types";
import type { LeagueDetailResponse } from "@/lib/league-detail-types";

interface Props {
  detail: LeagueDetailResponse;
  lang: "tr" | "en";
}

function formatKickoff(iso: string, lang: "tr" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return ""; }
}

const FT = new Set(["FT", "AET", "PEN"]);
const LIVE = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"]);

function TeamCell({
  team,
  side,
  lang,
}: {
  team: FixtureTeam;
  side: "home" | "away";
  lang: "tr" | "en";
}) {
  const cls = `lig-fix-team lig-fix-${side}`;
  const name = <span className="lig-fix-name">{team.name}</span>;
  const logo = <TeamLogo name={team.name} logo={team.logo ?? null} size={20} />;
  const inner = side === "home" ? (<>{name}{logo}</>) : (<>{logo}{name}</>);
  if (team.slug) {
    const slug: string = team.slug;
    return (
      <Link
        href={teamPath(lang, slug)}
        className={cls}
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

function FixtureRow({ f, lang }: { f: FixtureSummary; lang: "tr" | "en" }) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const finished = FT.has(f.status.shortCode ?? "");
  const live = LIVE.has(f.status.shortCode ?? "");
  const showScore = (live || finished) && f.score.home != null && f.score.away != null;
  const slug = f.slug ?? buildEntitySlug(
    `${f.homeTeam.name}-${f.awayTeam.name}`,
    f.id,
  );
  // Row wrapper artik div — takim hucreleri ic Link icin tasarlandi.
  // Orta hucre (zaman/skor) tek mac sayfasi linki olur.
  return (
    <div className="lig-fix-row">
      <TeamCell team={f.homeTeam} side="home" lang={lang} />
      <Link href={matchPath(lang, slug)} className="lig-fix-center-link">
        <span className="lig-fix-time">
          {live ? (
            <span className="lig-fix-live">
              {f.status.elapsed != null ? `${f.status.elapsed}'` : t("CANLI", "LIVE")}
            </span>
          ) : (
            formatKickoff(f.kickoff, lang)
          )}
        </span>
        <span className={`lig-fix-score tnum ${live ? "is-live" : ""}`}>
          {showScore ? `${f.score.home} - ${f.score.away}` : "vs"}
        </span>
      </Link>
      <TeamCell team={f.awayTeam} side="away" lang={lang} />
    </div>
  );
}

export function LeagueFixturesTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const rounds = detail.rounds ?? [];

  const [activeIdx, setActiveIdx] = useState<number>(() => {
    if (rounds.length === 0) return 0;
    const now = Date.now();
    for (let i = 0; i < rounds.length; i++) {
      const has = rounds[i].fixtures.some((f) => {
        try { return new Date(f.kickoff).getTime() >= now; } catch { return false; }
      });
      if (has) return i;
    }
    return rounds.length - 1;
  });
  const tabRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = tabRefs.current[activeIdx];
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    // Sadece chip seridini kaydir — scrollIntoView sayfayi/body'yi de kaydirip
    // mobilde yatay kaymaya yol aciyordu.
    const elRect = el.getBoundingClientRect();
    const scRect = scroller.getBoundingClientRect();
    const delta =
      elRect.left - scRect.left - (scroller.clientWidth - el.clientWidth) / 2;
    scroller.scrollTo({ left: scroller.scrollLeft + delta, behavior: "smooth" });
  }, [activeIdx]);

  if (rounds.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Fikstur yok", "No fixtures")}</p>
        </section>
      </div>
    );
  }

  const active = rounds[activeIdx] ?? rounds[0];
  return (
    <div className="match-tab">
      <div className="standings-group-tabs-wrap">
        <div className="standings-group-tabs">
          {rounds.map((r, i) => (
            <button
              key={r.roundName + i}
              type="button"
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => setActiveIdx(i)}
              className={`standings-group-tab ${i === activeIdx ? "is-active" : ""}`}
            >
              {r.roundNameText ?? r.roundName}
            </button>
          ))}
        </div>
      </div>
      <section className="match-card">
        <ul className="lig-fix-list">
          {active.fixtures.map((f, idx) => (
            <li key={`${f.id}-${idx}`}>
              <FixtureRow f={f} lang={lang} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
