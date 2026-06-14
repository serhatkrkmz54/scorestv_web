"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { teamPath } from "@/lib/routes";
import { TeamHero } from "./TeamHero";
import { TeamTabs, type TeamTabKey, type TeamTabDef } from "./TeamTabs";
import { TeamOverviewTab } from "./tabs/TeamOverviewTab";
import { TeamSquadTab } from "./tabs/TeamSquadTab";
import { TeamFixturesTab } from "./tabs/TeamFixturesTab";
import { TeamStandingsTab } from "./tabs/TeamStandingsTab";
import { TeamTransfersTab } from "./tabs/TeamTransfersTab";
import { TeamStatsTab } from "./tabs/TeamStatsTab";
import { fetchTeamDetailClient } from "@/lib/team-detail-client";
import type { TeamDetailResponse } from "@/lib/team-detail-types";
import {
  IconList,
  IconLineup,
  IconBall,
  IconTrophy,
  IconSwap,
  IconBars,
} from "@/components/icons";

interface Props {
  initial: TeamDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

function tabDefs(lang: "tr" | "en", detail: TeamDetailResponse): TeamTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const tabs: TeamTabDef[] = [
    { key: "overview", label: t("Genel", "Overview"), icon: <IconList s={14} /> },
    { key: "squad", label: t("Kadro", "Squad"), icon: <IconLineup s={14} /> },
    { key: "fixtures", label: t("Fikstur", "Fixtures"), icon: <IconBall s={14} /> },
  ];
  if (detail.standingsPositions && detail.standingsPositions.length > 0) {
    tabs.push({
      key: "standings",
      label: t("Puan Durumu", "Standings"),
      icon: <IconTrophy s={14} />,
    });
  }
  if (detail.transfers && detail.transfers.length > 0) {
    tabs.push({
      key: "transfers",
      label: t("Transferler", "Transfers"),
      icon: <IconSwap s={14} />,
    });
  }
  if (detail.statistics && detail.statistics.length > 0) {
    tabs.push({
      key: "stats",
      label: t("Istatistik", "Stats"),
      icon: <IconBars s={14} />,
    });
  }
  return tabs;
}

export function TeamDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<TeamDetailResponse>(initial);
  const [tab, setTab] = useState<TeamTabKey>("overview");
  const [, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Canonical slug redirect: backend response.slug dile gore dogru slug
  // doner (TR: "brezilya-6", EN: "brazil-6"). URL'deki slug yanlissa
  // (dil switcher prefix'i degistirdi ama slug'i koruyamadi), URL'i
  // sessizce duzelt.
  useEffect(() => {
    const canonical = detail.slug;
    if (!canonical || canonical === slug) return;
    const qs = searchParams?.toString();
    const target = teamPath(lang, canonical) + (qs ? `?${qs}` : "");
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
        const fresh = await fetchTeamDetailClient(slug, lang, { season });
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
    <div className="team-detail-screen">
      <TeamHero
        detail={detail}
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        lang={lang}
      />
      <TeamTabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="team-detail-body">
        {tab === "overview" ? <TeamOverviewTab detail={detail} lang={lang} /> : null}
        {tab === "squad" ? <TeamSquadTab detail={detail} lang={lang} /> : null}
        {tab === "fixtures" ? <TeamFixturesTab detail={detail} lang={lang} /> : null}
        {tab === "standings" ? <TeamStandingsTab detail={detail} lang={lang} /> : null}
        {tab === "transfers" ? <TeamTransfersTab detail={detail} lang={lang} /> : null}
        {tab === "stats" ? <TeamStatsTab detail={detail} lang={lang} /> : null}
      </div>
    </div>
  );
}
