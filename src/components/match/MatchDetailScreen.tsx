"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { matchPath } from "@/lib/routes";
import { MatchHero } from "./MatchHero";
import { MatchTabs, type MatchTabKey, type MatchTabDef } from "./MatchTabs";
import { OverviewTab } from "./tabs/OverviewTab";
import { StatsTab } from "./tabs/StatsTab";
import { LineupsTab } from "./tabs/LineupsTab";
import { StandingsTab } from "./tabs/StandingsTab";
import { H2HTab } from "./tabs/H2HTab";
import { PredictionTab } from "./tabs/PredictionTab";
import { InjuriesTab } from "./tabs/InjuriesTab";
import { CommentsTab } from "./tabs/CommentsTab";
import { OddsTab } from "./tabs/OddsTab";
import { fetchMatchDetailClient } from "@/lib/match-detail-client";
import {
  createMatchDetailClient,
  type LiveEventUpdate,
  type LiveUpdate,
} from "@/lib/live-socket";
import type {
  MatchDetailResponse,
  MatchEvent,
} from "@/lib/match-detail-types";
import {
  IconList,
  IconBars,
  IconLineup,
  IconTrophy,
  IconSwap,
  IconChart,
  IconMed,
  IconChat,
  IconOdds,
} from "@/components/icons";

interface Props {
  initial: MatchDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

function tabDefs(lang: "tr" | "en", detail: MatchDetailResponse): MatchTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const hasOdds =
    !!detail.odds && !!detail.odds.markets && detail.odds.markets.length > 0;
  const tabs: MatchTabDef[] = [
    { key: "overview", label: t("Ozet", "Overview"), icon: <IconList s={14} /> },
    { key: "stats", label: t("Istatistik", "Stats"), icon: <IconBars s={14} /> },
    { key: "lineups", label: t("Dizilis", "Lineups"), icon: <IconLineup s={14} /> },
    { key: "standings", label: t("Puan Durumu", "Standings"), icon: <IconTrophy s={14} /> },
    { key: "h2h", label: "H2H", icon: <IconSwap s={14} /> },
    { key: "prediction", label: t("Tahmin", "Prediction"), icon: <IconChart s={14} /> },
  ];
  if (hasOdds) {
    tabs.push({ key: "odds", label: t("Iddaa", "Odds"), icon: <IconOdds s={14} /> });
  }
  tabs.push(
    { key: "injuries", label: t("Sakatlik", "Injuries"), icon: <IconMed s={14} /> },
    { key: "comments", label: t("Yorumlar", "Comments"), icon: <IconChat s={14} /> },
  );
  return tabs;
}

const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"]);
const FINAL_STATUSES = new Set(["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"]);

function shouldOpenWs(detail: MatchDetailResponse): boolean {
  if (LIVE_STATUSES.has(detail.status.shortCode)) return true;
  if (FINAL_STATUSES.has(detail.status.shortCode)) return false;
  try {
    const ko = new Date(detail.kickoff).getTime();
    const now = Date.now();
    return now >= ko - 30 * 60000 && now <= ko + 180 * 60000;
  } catch {
    return false;
  }
}

function eventKey(e: {
  elapsed?: number | null;
  type: string;
  teamId: number;
  playerId?: number | null;
  playerName?: string | null;
}): string {
  const player = e.playerId ?? e.playerName ?? "-";
  return `${e.elapsed ?? "?"}|${e.type}|${e.teamId}|${player}`;
}

export function MatchDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<MatchDetailResponse>(initial);
  const [tab, setTab] = useState<MatchTabKey>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Canonical slug redirect: dile gore dogru mac slug'i (TR ev/dep
  // takimlar TR adi, EN ham ad). URL'deki slug yanlissa, sessizce duzelt.
  useEffect(() => {
    const canonical = detail.slug;
    if (!canonical || canonical === slug) return;
    const qs = searchParams?.toString();
    const target = matchPath(lang, canonical) + (qs ? `?${qs}` : "");
    router.replace(target, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.slug, slug, lang]);

  const refresh = useCallback(
    async (opts: { force?: boolean } = {}) => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      setRefreshing(true);
      try {
        const fresh = await fetchMatchDetailClient(slug, lang, {
          forceRefresh: opts.force,
        });
        setDetail(fresh);
      } catch {
        // silent
      } finally {
        refreshingRef.current = false;
        setRefreshing(false);
      }
    },
    [slug, lang],
  );

  const handleScore = useCallback((u: LiveUpdate) => {
    setDetail((prev: MatchDetailResponse) => {
      if (!prev || u.id !== prev.id) return prev;
      const us = u.status as unknown as Record<string, unknown>;
      const statusPatch: Record<string, unknown> = {};
      if (us.shortCode != null) statusPatch.shortCode = String(us.shortCode);
      else if (us.short != null) statusPatch.shortCode = String(us.short);
      if (us.longText != null) statusPatch.longText = String(us.longText);
      else if (us.long != null) statusPatch.longText = String(us.long);
      if (us.elapsed !== undefined) statusPatch.elapsed = us.elapsed;
      if (us.extra !== undefined) statusPatch.extra = us.extra;
      return {
        ...prev,
        status: { ...prev.status, ...statusPatch } as MatchDetailResponse["status"],
        score: { ...prev.score, ...u.score },
        lastSyncedAt: u.lastSyncedAt ?? prev.lastSyncedAt,
      };
    });
  }, []);

  const handleEvent = useCallback((e: LiveEventUpdate) => {
    setDetail((prev: MatchDetailResponse) => {
      if (!prev) return prev;
      const incoming: MatchEvent = {
        elapsed: e.timeElapsed ?? null,
        extra: e.timeExtra ?? null,
        teamId: e.team?.id ?? 0,
        type: e.type,
        typeText: e.label ?? null,
        detail: e.detail ?? null,
        detailText: null,
        playerId: e.player?.id ?? null,
        playerName: e.player?.name ?? null,
        assistId: e.assist?.id ?? null,
        assistName: e.assist?.name ?? null,
      };
      const incomingKey = eventKey(incoming);
      const exists = prev.events.some((x: MatchEvent) => eventKey(x) === incomingKey);
      if (exists) return prev;
      const events = [...prev.events, incoming].sort(
        (a: MatchEvent, b: MatchEvent) => {
          const am = (a.elapsed ?? 0) * 100 + (a.extra ?? 0);
          const bm = (b.elapsed ?? 0) * 100 + (b.extra ?? 0);
          return am - bm;
        },
      );
      return { ...prev, events };
    });
  }, []);

  const handleLineupReady = useCallback(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;
    if (!shouldOpenWs(detail)) return;
    const client = createMatchDetailClient(url, detail.id, lang, {
      onScore: handleScore,
      onEvent: handleEvent,
      onLineupReady: handleLineupReady,
    });
    client.activate();
    return () => {
      void client.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.id, detail.status.shortCode, lang, handleScore, handleEvent, handleLineupReady]);

  const tabs = tabDefs(lang, detail);

  return (
    <div className="match-detail-screen">
      <MatchHero detail={detail} lang={lang} />
      <MatchTabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="match-detail-body">
        <TabContent tab={tab} detail={detail} lang={lang} />
      </div>
      {refreshing ? <span className="sr-only">refreshing</span> : null}
    </div>
  );
}

function TabContent({
  tab,
  detail,
  lang,
}: {
  tab: MatchTabKey;
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}) {
  switch (tab) {
    case "overview":
      return <OverviewTab detail={detail} lang={lang} />;
    case "stats":
      return <StatsTab detail={detail} lang={lang} />;
    case "lineups":
      return <LineupsTab detail={detail} lang={lang} />;
    case "standings":
      return <StandingsTab detail={detail} lang={lang} />;
    case "h2h":
      return <H2HTab detail={detail} lang={lang} />;
    case "prediction":
      return <PredictionTab detail={detail} lang={lang} />;
    case "odds":
      return <OddsTab detail={detail} lang={lang} />;
    case "injuries":
      return <InjuriesTab detail={detail} lang={lang} />;
    case "comments":
      return <CommentsTab detail={detail} lang={lang} />;
    default:
      return null;
  }
}
