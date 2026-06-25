"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { basketballLeaguePath } from "@/lib/routes";
import { fetchBasketballLeagueDetailClient } from "@/lib/basketball-league-client";
import type { BasketballLeagueDetailResponse } from "@/lib/basketball-league-types";
import { IconTrophy, IconBall } from "@/components/icons";
import { BasketballLeagueHero } from "./BasketballLeagueHero";
import {
  BasketballLeagueTabs,
  type BkLeagueTabKey,
  type BkLeagueTabDef,
} from "./BasketballLeagueTabs";
import { BasketballLeagueStandingsTab } from "./tabs/BasketballLeagueStandingsTab";
import { BasketballLeagueFixturesTab } from "./tabs/BasketballLeagueFixturesTab";

interface Props {
  initial: BasketballLeagueDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

function tabDefs(lang: "tr" | "en"): BkLeagueTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return [
    { key: "standings", label: t("Puan Durumu", "Standings"), icon: <IconTrophy s={14} /> },
    { key: "fixtures", label: t("Fikstür", "Fixtures"), icon: <IconBall s={14} /> },
  ];
}

export function BasketballLeagueDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<BasketballLeagueDetailResponse>(initial);
  const [tab, setTab] = useState<BkLeagueTabKey>("standings");
  const [, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Canonical slug redirect — backend dile gore dogru slug doner.
  useEffect(() => {
    const canonical = detail.slug;
    if (!canonical || canonical === slug) return;
    const qs = searchParams?.toString();
    const target = basketballLeaguePath(lang, canonical) + (qs ? `?${qs}` : "");
    router.replace(target, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.slug, slug, lang]);

  const handleSeasonChange = useCallback(
    async (season: string) => {
      if (refreshingRef.current) return;
      if (season === (detail.selectedSeason ?? detail.currentSeason)) return;
      refreshingRef.current = true;
      setRefreshing(true);
      const params = new URLSearchParams();
      params.set("season", season);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      try {
        const fresh = await fetchBasketballLeagueDetailClient(slug, lang, { season });
        setDetail(fresh);
      } catch {
        // sessiz - eski state'i tut
      } finally {
        refreshingRef.current = false;
        setRefreshing(false);
      }
    },
    [slug, lang, detail.selectedSeason, detail.currentSeason, router, pathname],
  );

  const tabs = tabDefs(lang);
  const selectedSeason = detail.selectedSeason ?? detail.currentSeason ?? null;

  return (
    <div className="league-detail-screen">
      <BasketballLeagueHero
        detail={detail}
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        lang={lang}
      />
      <BasketballLeagueTabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="league-detail-body">
        {tab === "standings" ? (
          <BasketballLeagueStandingsTab detail={detail} lang={lang} />
        ) : null}
        {tab === "fixtures" ? (
          <BasketballLeagueFixturesTab detail={detail} lang={lang} />
        ) : null}
      </div>
    </div>
  );
}
