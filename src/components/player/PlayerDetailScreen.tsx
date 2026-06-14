"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { playerPath } from "@/lib/routes";
import { PlayerHero } from "./PlayerHero";
import { PlayerTabs, type PlayerTabKey, type PlayerTabDef } from "./PlayerTabs";
import { PlayerOverviewTab } from "./tabs/PlayerOverviewTab";
import { PlayerStatsTab } from "./tabs/PlayerStatsTab";
import { PlayerCareerTab } from "./tabs/PlayerCareerTab";
import { PlayerTransfersTab } from "./tabs/PlayerTransfersTab";
import { PlayerSidelinedTab } from "./tabs/PlayerSidelinedTab";
import { PlayerTrophiesTab } from "./tabs/PlayerTrophiesTab";
import { fetchPlayerDetailClient } from "@/lib/player-detail-client";
import type { PlayerDetailResponse } from "@/lib/player-detail-types";
import {
  IconList,
  IconBars,
  IconLineup,
  IconSwap,
  IconMed,
  IconTrophy,
} from "@/components/icons";

interface Props {
  initial: PlayerDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

function tabDefs(lang: "tr" | "en", detail: PlayerDetailResponse): PlayerTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const tabs: PlayerTabDef[] = [
    { key: "overview", label: t("Genel", "Overview"), icon: <IconList s={14} /> },
  ];
  if (detail.seasonStats && detail.seasonStats.length > 0) {
    tabs.push({ key: "stats", label: t("Istatistik", "Stats"), icon: <IconBars s={14} /> });
  }
  if (detail.careerTeams && detail.careerTeams.length > 0) {
    tabs.push({ key: "career", label: t("Kariyer", "Career"), icon: <IconLineup s={14} /> });
  }
  if (detail.transfers && detail.transfers.length > 0) {
    tabs.push({ key: "transfers", label: t("Transferler", "Transfers"), icon: <IconSwap s={14} /> });
  }
  if (detail.sidelined && detail.sidelined.length > 0) {
    tabs.push({ key: "sidelined", label: t("Sakatlik", "Injuries"), icon: <IconMed s={14} /> });
  }
  if (detail.trophies && detail.trophies.length > 0) {
    tabs.push({ key: "trophies", label: t("Kupalar", "Trophies"), icon: <IconTrophy s={14} /> });
  }
  return tabs;
}

export function PlayerDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<PlayerDetailResponse>(initial);
  const [tab, setTab] = useState<PlayerTabKey>("overview");
  const [, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Canonical slug redirect: backend response.slug dile gore dogru slug.
  useEffect(() => {
    const canonical = detail.slug;
    if (!canonical || canonical === slug) return;
    const qs = searchParams?.toString();
    const target = playerPath(lang, canonical) + (qs ? `?${qs}` : "");
    router.replace(target, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.slug, slug, lang]);

  const handleSeasonChange = useCallback(
    async (season: number) => {
      if (refreshingRef.current) return;
      if (season === (detail.selectedSeason ?? null)) return;
      refreshingRef.current = true;
      setRefreshing(true);
      const params = new URLSearchParams();
      params.set("season", String(season));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      try {
        const fresh = await fetchPlayerDetailClient(slug, lang, { season });
        setDetail(fresh);
      } catch {
        // sessiz - eski state'i tut
      } finally {
        refreshingRef.current = false;
        setRefreshing(false);
      }
    },
    [slug, lang, detail.selectedSeason, router, pathname],
  );

  const tabs = tabDefs(lang, detail);
  const selectedSeason = detail.selectedSeason ?? null;

  return (
    <div className="player-detail-screen">
      <PlayerHero
        detail={detail}
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        lang={lang}
      />
      <PlayerTabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="player-detail-body">
        {tab === "overview" ? <PlayerOverviewTab detail={detail} lang={lang} /> : null}
        {tab === "stats" ? <PlayerStatsTab detail={detail} lang={lang} /> : null}
        {tab === "career" ? <PlayerCareerTab detail={detail} lang={lang} /> : null}
        {tab === "transfers" ? <PlayerTransfersTab detail={detail} lang={lang} /> : null}
        {tab === "sidelined" ? <PlayerSidelinedTab detail={detail} lang={lang} /> : null}
        {tab === "trophies" ? <PlayerTrophiesTab detail={detail} lang={lang} /> : null}
      </div>
    </div>
  );
}
