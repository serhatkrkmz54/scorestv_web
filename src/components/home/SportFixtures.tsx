"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/context/lang-context";
import { useFavorites } from "@/context/favorites-context";
import { HOME_STR } from "@/i18n/home-strings";
import { categorizeSport } from "@/lib/sport-scores";
import type {
  SportDayResponse,
  SportLeagueGroup,
} from "@/lib/sport-scores-types";
import type { Sport } from "@/lib/sports";
import { SPORTS } from "@/lib/sports";
import type {
  FixtureDatesResponse,
  StatusFilter,
} from "@/lib/fixtures-types";
import { IconBasket, IconVolley } from "@/components/icons";
import { DateStrip } from "./DateStrip";
import { StatusChips, type StatusCounts } from "./StatusChips";
import { SportLeagueBlock } from "./SportLeagueBlock";

// Basketbol/voleybol anasayfa fikstur feed'i. Futbol HomeFixtures esi —
// ayri tutuldu cunku skor sekli + status kodlari + veri kaynagi farkli.
// Tarih seridi futbol /api/fixtures/dates feed'ini takvim UI'i icin kullanir.
export function SportFixtures({ sport }: { sport: Sport }) {
  const { lang } = useLang();
  const { has } = useFavorites();
  const t = HOME_STR[lang];
  const cfg = SPORTS[sport];

  const [dates, setDates] = useState<FixtureDatesResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [day, setDay] = useState<SportDayResponse | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Takvim tarihleri (futbol feed'i; yalnizca UI gun secimi icin).
  useEffect(() => {
    let active = true;
    fetch(`/api/fixtures/dates?days=5&lang=${lang}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<FixtureDatesResponse>) : null))
      .then((d) => {
        if (!active || !d) return;
        setDates(d);
        setSelectedDate((prev) => prev ?? d.today);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lang]);

  // Spor fikstur verisini cek (tarih/dil/spor degisince + 30sn polling).
  useEffect(() => {
    if (!selectedDate) return;
    let active = true;
    const load = async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(false);
      }
      try {
        const r = await fetch(
          `${cfg.fixturesApi}?date=${selectedDate}&status=all&lang=${lang}`,
          { cache: "no-store" },
        );
        if (!r.ok) throw new Error("fetch failed");
        const d = (await r.json()) as SportDayResponse;
        if (active) {
          setDay(d);
          setError(false);
        }
      } catch {
        if (active && !silent) {
          setError(true);
          setDay(null);
        }
      } finally {
        if (active && !silent) setLoading(false);
      }
    };
    void load();
    const id = setInterval(() => void load(true), 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [selectedDate, lang, cfg.fixturesApi]);

  const counts = useMemo<StatusCounts>(() => {
    const c: StatusCounts = { all: 0, fav: 0, live: 0, upcoming: 0, finished: 0 };
    day?.leagues.forEach((g) =>
      g.games.forEach((game) => {
        c.all++;
        c[categorizeSport(sport, game.status)]++;
        if (has(game.id)) c.fav++;
      }),
    );
    return c;
  }, [day, has, sport]);

  const groups = useMemo<SportLeagueGroup[]>(() => {
    if (!day) return [];
    if (status === "all") return day.leagues;
    return day.leagues
      .map((g) => ({
        league: g.league,
        games: g.games.filter((game) =>
          status === "fav" ? has(game.id) : categorizeSport(sport, game.status) === status,
        ),
      }))
      .filter((g) => g.games.length > 0);
  }, [day, status, has, sport]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- favori maç kalmayınca "Tümü"ne dön (kasıtlı)
    if (status === "fav" && counts.fav === 0) setStatus("all");
  }, [status, counts.fav]);

  const reload = () => {
    if (selectedDate) {
      setSelectedDate((d) => d); // no-op; trigger via re-fetch below
    }
    setLoading(true);
    setError(false);
    fetch(`${cfg.fixturesApi}?date=${selectedDate}&status=all&lang=${lang}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? (r.json() as Promise<SportDayResponse>) : Promise.reject()))
      .then((d) => {
        setDay(d);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setDay(null);
      })
      .finally(() => setLoading(false));
  };

  const Empty = sport === "basketball" ? IconBasket : IconVolley;

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
        {dates ? (
          <button
            type="button"
            className={"cal-btn cal-today" + (selectedDate === dates.today ? " on" : "")}
            onClick={() => setSelectedDate(dates.today)}
          >
            {lang === "tr" ? "Bugün" : "Today"}
          </button>
        ) : null}
      </div>

      <StatusChips counts={counts} status={status} onChange={setStatus} />

      {loading ? (
        <div className="card empty">
          <span className="spin" style={{ width: 30, height: 30, color: "var(--accent)" }} />
          <p style={{ marginTop: 14 }}>{t.loading}</p>
        </div>
      ) : error ? (
        <div className="card empty">
          <Empty s={40} />
          <p>{t.loadError}</p>
          <button className="login-btn" style={{ marginTop: 14 }} onClick={reload}>
            {t.retry}
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="card empty">
          <Empty s={40} />
          <p>{t.noMatch}</p>
        </div>
      ) : (
        groups.map((g) => (
          <SportLeagueBlock key={g.league.id} group={g} sport={sport} />
        ))
      )}
    </div>
  );
}
