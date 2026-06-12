"use client";

import { useEffect, useMemo } from "react";
import { useLang } from "@/context/lang-context";
import { useFavorites } from "@/context/favorites-context";
import { useHome } from "@/context/home-context";
import { HOME_STR } from "@/i18n/home-strings";
import { categorize } from "@/lib/fixtures";
import type { LeagueGroup } from "@/lib/fixtures-types";
import { IconBall, IconCalendar } from "@/components/icons";
import { DateStrip } from "./DateStrip";
import { StatusChips, type StatusCounts } from "./StatusChips";
import { LeagueBlock } from "./LeagueBlock";

export function HomeFixtures() {
  const { lang } = useLang();
  const { has } = useFavorites();
  const t = HOME_STR[lang];
  const { dates, day, selectedDate, setSelectedDate, status, setStatus, loading, error, reload } =
    useHome();

  const counts = useMemo<StatusCounts>(() => {
    const c: StatusCounts = { all: 0, fav: 0, live: 0, upcoming: 0, finished: 0 };
    day?.leagues.forEach((g) =>
      g.fixtures.forEach((f) => {
        c.all++;
        c[categorize(f.status)]++;
        if (has(f.id)) c.fav++;
      }),
    );
    return c;
  }, [day, has]);

  const groups = useMemo<LeagueGroup[]>(() => {
    if (!day) return [];
    if (status === "all") return day.leagues;
    return day.leagues
      .map((g) => ({
        league: g.league,
        fixtures: g.fixtures.filter((f) =>
          status === "fav" ? has(f.id) : categorize(f.status) === status,
        ),
      }))
      .filter((g) => g.fixtures.length > 0);
  }, [day, status, has]);

  // Favori maç kalmadıysa ve "Favoriler" sekmesindeysek "Tümü"ne dön.
  useEffect(() => {
    if (status === "fav" && counts.fav === 0) setStatus("all");
  }, [status, counts.fav, setStatus]);

  return (
    <div className="main-col">
      <div className="toolbar">
        {dates ? (
          <DateStrip
            dates={dates.dates}
            today={dates.today}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        ) : (
          <div className="date-strip" style={{ height: 48 }} />
        )}
        <button className="cal-btn">
          <IconCalendar s={16} /> {t.calendar}
        </button>
      </div>

      <StatusChips counts={counts} status={status} onChange={setStatus} />

      {loading ? (
        <div className="card empty">
          <span className="spin" style={{ width: 30, height: 30, color: "var(--accent)" }} />
          <p style={{ marginTop: 14 }}>{t.loading}</p>
        </div>
      ) : error ? (
        <div className="card empty">
          <IconBall s={40} />
          <p>{t.loadError}</p>
          <button className="login-btn" style={{ marginTop: 14 }} onClick={reload}>
            {t.retry}
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="card empty">
          <IconBall s={40} />
          <p>{t.noMatch}</p>
        </div>
      ) : (
        groups.map((g) => <LeagueBlock key={g.league.id} group={g} />)
      )}
    </div>
  );
}
