"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLang } from "./lang-context";
import { categorize } from "@/lib/fixtures";
import { createLiveClient, type LiveUpdate } from "@/lib/live-socket";
import type {
  FixtureDatesResponse,
  FixtureDayResponse,
  FixtureSummary,
  LeagueGroup,
  StatusFilter,
} from "@/lib/fixtures-types";

interface HomeCtxValue {
  dates: FixtureDatesResponse | null;
  day: FixtureDayResponse | null;
  selectedDate: string | null;
  setSelectedDate: (d: string) => void;
  status: StatusFilter;
  setStatus: (s: StatusFilter) => void;
  loading: boolean;
  error: boolean;
  reload: () => void;
  /** featured sıralı lig grupları (fikstürden). */
  leagues: LeagueGroup[];
  /** şu an canlı olan maçlar (tüm liglerden). */
  liveFixtures: FixtureSummary[];
}

const HomeCtx = createContext<HomeCtxValue | null>(null);

export function HomeProvider({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const [dates, setDates] = useState<FixtureDatesResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [day, setDay] = useState<FixtureDayResponse | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Backend kapalıysa başarana kadar 5sn'de bir tekrar dener; geri gelince
    // selectedDate set olur, fikstür yüklenir — F5 gerektirmez.
    const load = async () => {
      try {
        const r = await fetch(`/api/fixtures/dates?days=5&lang=${lang}`, { cache: "no-store" });
        if (!r.ok) throw new Error("bad");
        const d = (await r.json()) as FixtureDatesResponse;
        if (!active) return;
        setDates(d);
        setSelectedDate((prev) => prev ?? d.today);
      } catch {
        if (active) timer = setTimeout(load, 5000);
      }
    };
    void load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [lang]);

  const loadFixtures = useCallback(
    async (date: string, silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(false);
      }
      try {
        const r = await fetch(`/api/fixtures?date=${date}&status=all&lang=${lang}`, {
          cache: "no-store",
        });
        if (!r.ok) throw new Error("fetch failed");
        setDay((await r.json()) as FixtureDayResponse);
        setError(false);
      } catch {
        if (!silent) {
          setError(true);
          setDay(null);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [lang],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tarih/dil değişince veri çekme (kasıtlı)
    if (selectedDate) void loadFixtures(selectedDate);
  }, [selectedDate, loadFixtures]);

  useEffect(() => {
    if (!selectedDate) return;
    const id = setInterval(() => void loadFixtures(selectedDate, true), 30000);
    return () => clearInterval(id);
  }, [selectedDate, loadFixtures]);

  // Ağ/sekme geri gelince anında tazele (backend tekrar açılınca F5 beklemeden).
  useEffect(() => {
    const onRecover = () => {
      if (selectedDate) void loadFixtures(selectedDate, true);
    };
    window.addEventListener("online", onRecover);
    window.addEventListener("focus", onRecover);
    return () => {
      window.removeEventListener("online", onRecover);
      window.removeEventListener("focus", onRecover);
    };
  }, [selectedDate, loadFixtures]);

  const reload = useCallback(() => {
    if (selectedDate) void loadFixtures(selectedDate);
  }, [selectedDate, loadFixtures]);

  // Canlı WebSocket güncellemesini mevcut güne işle (id'ye göre durum + skor).
  const applyUpdate = useCallback((u: LiveUpdate) => {
    setDay((prev) => {
      if (!prev) return prev;
      let found = false;
      const leagues = prev.leagues.map((g) => ({
        ...g,
        fixtures: g.fixtures.map((f) => {
          if (f.id !== u.id) return f;
          found = true;
          return { ...f, status: u.status, score: u.score, lastSyncedAt: u.lastSyncedAt ?? f.lastSyncedAt };
        }),
      }));
      return found ? { ...prev, leagues } : prev;
    });
  }, []);

  // STOMP WebSocket — /ws/fixtures → /topic/fixtures/live/{lang}. (Polling de fallback olarak kalır.)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;
    const client = createLiveClient(url, lang, applyUpdate);
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [lang, applyUpdate]);

  const leagues = useMemo<LeagueGroup[]>(() => day?.leagues ?? [], [day]);

  const liveFixtures = useMemo<FixtureSummary[]>(() => {
    const out: FixtureSummary[] = [];
    day?.leagues.forEach((g) =>
      g.fixtures.forEach((f) => {
        if (categorize(f.status) === "live") out.push(f);
      }),
    );
    return out;
  }, [day]);

  return (
    <HomeCtx.Provider
      value={{
        dates,
        day,
        selectedDate,
        setSelectedDate,
        status,
        setStatus,
        loading,
        error,
        reload,
        leagues,
        liveFixtures,
      }}
    >
      {children}
    </HomeCtx.Provider>
  );
}

export function useHome(): HomeCtxValue {
  const ctx = useContext(HomeCtx);
  if (!ctx) throw new Error("useHome must be used within HomeProvider");
  return ctx;
}

// HomeProvider yoksa null doner; Subnav gibi global bilesenler bu hook'la
// canli sayisini guvenli okur.
export function useHomeOptional(): HomeCtxValue | null {
  return useContext(HomeCtx);
}
