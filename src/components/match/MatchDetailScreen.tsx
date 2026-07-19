"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { matchPath } from "@/lib/routes";
import { MatchHero } from "./MatchHero";
import { MatchStickyScore } from "./MatchStickyScore";
import { MatchTabs, type MatchTabKey, type MatchTabDef } from "./MatchTabs";
import { OverviewTab } from "./tabs/OverviewTab";
import { StatsTab } from "./tabs/StatsTab";
import { LineupsTab } from "./tabs/LineupsTab";
import { StandingsTab } from "./tabs/StandingsTab";
import { H2HTab } from "./tabs/H2HTab";
import { PredictionTab } from "./tabs/PredictionTab";
import { InjuriesTab } from "./tabs/InjuriesTab";
import { CommentsTab } from "./tabs/CommentsTab";
import { HighlightsTab } from "./tabs/HighlightsTab";
import { OddsTab } from "./tabs/OddsTab";
import { BroadcastsTab } from "./tabs/BroadcastsTab";
import type { Broadcast } from "@/lib/broadcast-types";
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
import type { Highlight } from "@/lib/highlights-types";
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
  IconPlay,
} from "@/components/icons";

interface Props {
  initial: MatchDetailResponse;
  slug: string;
  lang: "tr" | "en";
  /** Biten maçta SSR'da çekilen highlight listesi — "Maç Özeti" sekmesini
   *  sunucu-render'lı (indekslenebilir) yapmak için. Yoksa client fetch eder. */
  initialHighlights?: Highlight[];
}

// Highlight'ı olan biten maçta varsayılan aktif sekme "Maç Özeti" olur —
// oynatıcı sayfa açılışında görünür/DOM'da olsun (Google video indexleme).
const HL_FINISHED = new Set(["FT", "AET", "PEN"]);

function tabDefs(
  lang: "tr" | "en",
  detail: MatchDetailResponse,
  hasBroadcasts: boolean,
): MatchTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const hasOdds =
    !!detail.odds && !!detail.odds.markets && detail.odds.markets.length > 0;
  const tabs: MatchTabDef[] = [
    { key: "overview", label: t("Özet", "Overview"), icon: <IconList s={14} /> },
    { key: "stats", label: t("İstatistik", "Stats"), icon: <IconBars s={14} /> },
    { key: "lineups", label: t("Diziliş", "Lineups"), icon: <IconLineup s={14} /> },
    { key: "standings", label: t("Puan Durumu", "Standings"), icon: <IconTrophy s={14} /> },
    { key: "h2h", label: "H2H", icon: <IconSwap s={14} /> },
    { key: "prediction", label: t("Tahmin", "Prediction"), icon: <IconChart s={14} /> },
  ];
  // Yayınlar — yalnız veri varsa, Puan Durumu (standings) tab'ının hemen sağında.
  if (hasBroadcasts) {
    tabs.splice(4, 0, {
      key: "broadcasts",
      label: t("Yayınlar", "Broadcasts"),
      icon: (
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="7" width="20" height="13" rx="2" />
          <path d="m17 2-5 5-5-5" />
        </svg>
      ),
    });
  }
  if (hasOdds) {
    tabs.push({ key: "odds", label: t("İddaa", "Odds"), icon: <IconOdds s={14} /> });
  }
  tabs.push(
    { key: "injuries", label: t("Sakatlık", "Injuries"), icon: <IconMed s={14} /> },
    { key: "comments", label: t("Yorumlar", "Comments"), icon: <IconChat s={14} /> },
  );
  // Maç özeti (highlights) — yalnız oynanıp biten maçlarda, en başta.
  if (new Set(["FT", "AET", "PEN"]).has(detail.status.shortCode)) {
    tabs.unshift({
      key: "highlights",
      label: t("Maç Özeti", "Highlights"),
      icon: <IconPlay s={14} />,
    });
  }
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

/**
 * Yan modullerin TAMAMI bos mu? Backend tam bu durumda cevabi cache'LEMEZ
 * (loadCachedResponse @Cacheable unless), cunku lazy-sync henuz bitmemis
 * demektir. Boyle bir cevap geldiyse client sessizce yeniden cekmeli.
 */
function isThin(d: MatchDetailResponse): boolean {
  return (
    d.events.length === 0 &&
    d.lineups.length === 0 &&
    d.statistics.length === 0 &&
    d.playerStats.length === 0 &&
    d.headToHead.length === 0 &&
    d.standings.length === 0 &&
    d.injuries.length === 0 &&
    !d.prediction
  );
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

export function MatchDetailScreen({ initial, slug, lang, initialHighlights }: Props) {
  const [detail, setDetail] = useState<MatchDetailResponse>(initial);
  const startTab: MatchTabKey =
    HL_FINISHED.has(initial.status.shortCode) &&
    (initialHighlights?.length ?? 0) > 0
      ? "highlights"
      : "overview";
  const [tab, setTab] = useState<MatchTabKey>(startTab);
  const [refreshing, setRefreshing] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const refreshingRef = useRef(false);
  const detailRef = useRef(detail);
  detailRef.current = detail;
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [heroOut, setHeroOut] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hero ekrandan cikinca (yukari kayinca) kompakt sticky skor barini goster.
  // rootMargin ust ofseti = fixed header + subnav yuksekligi (CSS degiskeni).
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const cs = getComputedStyle(document.documentElement);
    const px = (v: string) => parseInt(cs.getPropertyValue(v), 10) || 0;
    const offset = px("--header-h") + px("--subnav-h") + 4;
    const io = new IntersectionObserver(
      ([entry]) => setHeroOut(!entry.isIntersecting),
      { rootMargin: `-${offset}px 0px 0px 0px`, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

  // Gecmis / yeni acilan mac: backend ilk istekte arka planda lazy-sync
  // tetikliyor, ama bitmis maclar icin WebSocket ACILMIYOR — bu yuzden veri
  // F5 atmadan gelmiyordu. Cevap "ince" (hicbir yan modul yok) ve mac WS ile
  // beslenmeyecekse, dolana kadar birkac kez sessizce yeniden cek (backoff).
  useEffect(() => {
    if (shouldOpenWs(initial)) return;       // canli/yakin → WS zaten gunceller
    if (!isThin(detailRef.current)) return;  // veri zaten var → poll'a gerek yok

    let cancelled = false;
    let attempt = 0;
    const delays = [1500, 2500, 4000, 6000, 9000]; // ~5 deneme / ~23sn
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (cancelled || attempt >= delays.length) return;
      if (!isThin(detailRef.current)) return; // doldu → dur
      const wait = delays[attempt];
      attempt += 1;
      timer = setTimeout(async () => {
        if (cancelled) return;
        await refresh();
        schedule();
      }, wait);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.id]);

  // Yayınlar (TV kanalları) — tab koşulu + içeriği için bir kez çek.
  useEffect(() => {
    let aborted = false;
    fetch(`/api/broadcasts/fixtures/${detail.id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((j: Broadcast[]) => {
        if (!aborted) setBroadcasts(Array.isArray(j) ? j : []);
      })
      .catch(() => {
        if (!aborted) setBroadcasts([]);
      });
    return () => {
      aborted = true;
    };
  }, [detail.id]);

  const tabs = tabDefs(lang, detail, broadcasts.length > 0);

  return (
    <div className="match-detail-screen">
      <div ref={heroRef}>
        <MatchHero detail={detail} lang={lang} />
      </div>
      <MatchStickyScore detail={detail} lang={lang} visible={heroOut} />
      <MatchTabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="match-detail-body">
        <TabContent
          tab={tab}
          detail={detail}
          lang={lang}
          broadcasts={broadcasts}
          initialHighlights={initialHighlights}
        />
      </div>
      {refreshing ? <span className="sr-only">refreshing</span> : null}
    </div>
  );
}

function TabContent({
  tab,
  detail,
  lang,
  broadcasts,
  initialHighlights,
}: {
  tab: MatchTabKey;
  detail: MatchDetailResponse;
  lang: "tr" | "en";
  broadcasts: Broadcast[];
  initialHighlights?: Highlight[];
}) {
  switch (tab) {
    case "highlights":
      return (
        <HighlightsTab
          detail={detail}
          lang={lang}
          initialItems={initialHighlights ?? null}
        />
      );
    case "overview":
      return <OverviewTab detail={detail} lang={lang} />;
    case "broadcasts":
      return <BroadcastsTab broadcasts={broadcasts} lang={lang} />;
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
      return <CommentsTab targetId={detail.id} segment="fixtures" lang={lang} />;
    default:
      return null;
  }
}
