"use client";

import { MatchRow } from "@/components/home/MatchRow";
import { IconBall } from "@/components/icons";
import type { FixtureSummary } from "@/lib/fixtures-types";
import type { TeamDetailResponse } from "@/lib/team-detail-types";

interface Props {
  detail: TeamDetailResponse;
  lang: "tr" | "en";
}

// Aynı tarihteki maçları gruplar — backend zaten kronolojik gönderiyor,
// burası sadece tarih header'ı ekleyip görünümü düzenliyor.
function groupByDate(fixtures: FixtureSummary[]): { date: Date; list: FixtureSummary[] }[] {
  const map = new Map<string, { date: Date; list: FixtureSummary[] }>();
  const order: string[] = [];
  for (const f of fixtures) {
    const d = new Date(f.kickoff);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    if (!map.has(key)) {
      map.set(key, { date: d, list: [] });
      order.push(key);
    }
    map.get(key)!.list.push(f);
  }
  return order.map((k) => map.get(k)!);
}

function formatDateHeader(d: Date, lang: "tr" | "en"): string {
  const formatter = new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const out = formatter.format(d);
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function FixtureGroup({
  title,
  fixtures,
  lang,
}: {
  title: string;
  fixtures: FixtureSummary[];
  lang: "tr" | "en";
}) {
  if (fixtures.length === 0) return null;
  const groups = groupByDate(fixtures);
  return (
    <section className="match-card">
      <header className="match-card-head">
        <h2>
          <IconBall s={14} /> {title}
        </h2>
      </header>
      <div className="team-fix-grouped">
        {groups.map((g, i) => (
          <div key={i} className="team-fix-group">
            <div className="team-fix-date-head">{formatDateHeader(g.date, lang)}</div>
            <div className="team-fix-list">
              {g.list.map((f) => (
                <MatchRow key={f.id} fixture={f} showLeague />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TeamFixturesTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const upcoming = detail.upcomingFixtures ?? [];
  const recent = detail.recentFixtures ?? [];
  if (upcoming.length === 0 && recent.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Fikstür bulunamadı", "No fixtures")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab team-tab-fixtures">
      <FixtureGroup
        title={t("Sıradakı Maçlar", "Upcoming Matches")}
        fixtures={upcoming}
        lang={lang}
      />
      <FixtureGroup
        title={t("Son Maçlar", "Recent Matches")}
        fixtures={recent}
        lang={lang}
      />
    </div>
  );
}
