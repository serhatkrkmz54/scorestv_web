"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { leaguePath } from "@/lib/routes";
import { LeagueHero } from "./LeagueHero";
import { LeagueTabs, type LeagueTabKey, type LeagueTabDef } from "./LeagueTabs";
import { LeagueOverviewTab } from "./tabs/LeagueOverviewTab";
import { LeagueStandingsTab } from "./tabs/LeagueStandingsTab";
import { LeagueFixturesTab } from "./tabs/LeagueFixturesTab";
import { LeagueTopPlayersTab } from "./tabs/LeagueTopPlayersTab";
import { fetchLeagueDetailClient } from "@/lib/league-detail-client";
import type { LeagueDetailResponse } from "@/lib/league-detail-types";
import {
  IconList,
  IconTrophy,
  IconBars,
  IconBall,
} from "@/components/icons";

interface Props {
  initial: LeagueDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

function tabDefs(lang: "tr" | "en"): LeagueTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return [
    { key: "overview", label: t("Genel", "Overview"), icon: <IconList s={14} /> },
    { key: "standings", label: t("Puan Durumu", "Standings"), icon: <IconTrophy s={14} /> },
    { key: "fixtures", label: t("Fikstür", "Fixtures"), icon: <IconBall s={14} /> },
    { key: "topplayers", label: t("Lider Tablosu", "Top Players"), icon: <IconBars s={14} /> },
  ];
}

export function LeagueDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<LeagueDetailResponse>(initial);
  const [tab, setTab] = useState<LeagueTabKey>("overview");
  const [, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Canonical slug redirect: backend response.slug dile gore dogru slug
  // doner. URL'deki slug yanlissa (dil switcher prefix'i degistirdi ama
  // slug'i koruyamadi), URL'i sessizce duzelt.
  useEffect(() => {
    const canonical = detail.slug;
    if (!canonical || canonical === slug) return;
    const qs = searchParams?.toString();
    const target = leaguePath(lang, canonical) + (qs ? `?${qs}` : "");
    router.replace(target, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.slug, slug, lang]);

  const handleSeasonChange = useCallback(
    async (season: number) => {
      if (refreshingRef.current) return;
      if (season === (detail.selectedSeason ?? detail.currentSeason)) return;
      refreshingRef.current = true;
      setRefreshing(true);
      // URL'i guncelle ki F5 sonrasi ayni sezon kalsin
      const params = new URLSearchParams();
      params.set("season", String(season));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      try {
        const fresh = await fetchLeagueDetailClient(slug, lang, { season });
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
      <LeagueHero
        detail={detail}
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        lang={lang}
      />
      <LeagueTabs tabs={tabs} active={tab} onChange={setTab} />
      {/*
        SEO: SSR verisinden gelen paneller (Genel/Puan Durumu/Lider Tablosu)
        sunucu HTML'ine basılır, aktif olmayanlar `hidden` ile gizlenir →
        Google tarar. Fikstür sekmesi client-side veri çektiği için (lazy)
        yalnızca aktifken mount edilir; sayfa açılışında gereksiz istek olmaz.
        (Taranabilir fikstür istenirse ayrıca SSR-seed edilmeli.)
      */}
      <div className="league-detail-body">
        <section role="tabpanel" id="league-panel-overview" hidden={tab !== "overview"}>
          <LeagueOverviewTab detail={detail} lang={lang} />
        </section>
        <section role="tabpanel" id="league-panel-standings" hidden={tab !== "standings"}>
          <LeagueStandingsTab detail={detail} lang={lang} />
        </section>
        <section role="tabpanel" id="league-panel-topplayers" hidden={tab !== "topplayers"}>
          <LeagueTopPlayersTab detail={detail} lang={lang} />
        </section>
        {tab === "fixtures" ? (
          <section role="tabpanel" id="league-panel-fixtures">
            <LeagueFixturesTab detail={detail} lang={lang} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
