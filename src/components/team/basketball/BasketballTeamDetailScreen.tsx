"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchBasketballTeamDetailClient } from "@/lib/basketball-team-client";
import type { BasketballTeamDetailResponse } from "@/lib/basketball-team-types";
import { IconList, IconLineup, IconBall, IconChart } from "@/components/icons";
import { BasketballTeamHero } from "./BasketballTeamHero";
import {
  BasketballTeamTabs,
  type BkTeamTabKey,
  type BkTeamTabDef,
} from "./BasketballTeamTabs";
import { BasketballTeamOverviewTab } from "./tabs/BasketballTeamOverviewTab";
import { BasketballTeamSquadTab } from "./tabs/BasketballTeamSquadTab";
import { BasketballTeamFixturesTab } from "./tabs/BasketballTeamFixturesTab";
import { BasketballTeamStatsTab } from "./tabs/BasketballTeamStatsTab";

interface Props {
  initial: BasketballTeamDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

function tabDefs(lang: "tr" | "en"): BkTeamTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return [
    { key: "overview", label: t("Genel", "Overview"), icon: <IconList s={14} /> },
    { key: "squad", label: t("Kadro", "Squad"), icon: <IconLineup s={14} /> },
    { key: "fixtures", label: t("Fikstür", "Fixtures"), icon: <IconBall s={14} /> },
    { key: "stats", label: t("İstatistik", "Stats"), icon: <IconChart s={14} /> },
  ];
}

export function BasketballTeamDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<BasketballTeamDetailResponse>(initial);
  const [tab, setTab] = useState<BkTeamTabKey>("overview");
  const [, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSeasonChange = useCallback(
    async (season: string) => {
      if (refreshingRef.current) return;
      if (season === detail.selectedSeason) return;
      refreshingRef.current = true;
      setRefreshing(true);
      const params = new URLSearchParams();
      params.set("season", season);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      try {
        const fresh = await fetchBasketballTeamDetailClient(slug, lang, { season });
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

  const tabs = tabDefs(lang);
  const selectedSeason = detail.selectedSeason ?? null;

  return (
    <div className="team-detail-screen">
      <BasketballTeamHero
        detail={detail}
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        lang={lang}
      />
      <BasketballTeamTabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="team-detail-body">
        {tab === "overview" ? <BasketballTeamOverviewTab detail={detail} lang={lang} /> : null}
        {tab === "squad" ? <BasketballTeamSquadTab detail={detail} lang={lang} /> : null}
        {tab === "fixtures" ? <BasketballTeamFixturesTab detail={detail} lang={lang} /> : null}
        {tab === "stats" ? <BasketballTeamStatsTab detail={detail} lang={lang} /> : null}
      </div>
    </div>
  );
}
