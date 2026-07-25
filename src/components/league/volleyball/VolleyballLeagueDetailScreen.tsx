"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { volleyballLeaguePath } from "@/lib/routes";
import { fetchVolleyballLeagueDetailClient } from "@/lib/volleyball-league-client";
import type { VolleyballLeagueDetailResponse } from "@/lib/volleyball-league-types";
import { IconTrophy, IconVolley } from "@/components/icons";
import { VolleyballLeagueHero } from "./VolleyballLeagueHero";
import {
  VolleyballLeagueTabs,
  type VlLeagueTabKey,
  type VlLeagueTabDef,
} from "./VolleyballLeagueTabs";
import { VolleyballLeagueStandingsTab } from "./tabs/VolleyballLeagueStandingsTab";
import { VolleyballLeagueFixturesTab } from "./tabs/VolleyballLeagueFixturesTab";

interface Props {
  initial: VolleyballLeagueDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

function tabDefs(lang: "tr" | "en"): VlLeagueTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return [
    { key: "standings", label: t("Puan Durumu", "Standings"), icon: <IconTrophy s={14} /> },
    { key: "fixtures", label: t("Fikstür", "Fixtures"), icon: <IconVolley s={14} /> },
  ];
}

export function VolleyballLeagueDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<VolleyballLeagueDetailResponse>(initial);
  const [tab, setTab] = useState<VlLeagueTabKey>("standings");
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
    const target = volleyballLeaguePath(lang, canonical) + (qs ? `?${qs}` : "");
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
        const fresh = await fetchVolleyballLeagueDetailClient(slug, lang, { season });
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
      <VolleyballLeagueHero
        detail={detail}
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        lang={lang}
      />
      <VolleyballLeagueTabs tabs={tabs} active={tab} onChange={setTab} />
      {/* SEO: paneller sunucu HTML'ine basılır, aktif olmayan `hidden` ile
          gizlenir → Puan Durumu ve Fikstür Google tarafından taranabilir. */}
      <div className="league-detail-body">
        <section role="tabpanel" id="vl-league-panel-standings" hidden={tab !== "standings"}>
          <VolleyballLeagueStandingsTab detail={detail} lang={lang} />
        </section>
        <section role="tabpanel" id="vl-league-panel-fixtures" hidden={tab !== "fixtures"}>
          <VolleyballLeagueFixturesTab detail={detail} lang={lang} />
        </section>
      </div>
    </div>
  );
}
