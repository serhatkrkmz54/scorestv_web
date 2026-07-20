"use client";

import { useState, useCallback, useEffect } from "react";
import { BasketballHero } from "./BasketballHero";
import { BasketballStatsTab } from "./BasketballStatsTab";
import { BasketballStandingsTab } from "./BasketballStandingsTab";
import { BasketballH2HTab } from "./BasketballH2HTab";
import { MatchTabs, type MatchTabDef, type MatchTabKey } from "../MatchTabs";
import type { BasketballGameDetailResponse } from "@/lib/basketball-detail-types";
import { IconBars, IconTrophy, IconSwap } from "@/components/icons";

interface Props {
  initial: BasketballGameDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

const LIVE = new Set(["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT", "LIVE"]);

function isLiveDetail(d: BasketballGameDetailResponse): boolean {
  return LIVE.has(d.status?.shortName ?? "");
}

async function fetchClient(
  slug: string,
  lang: "tr" | "en",
  force = false,
): Promise<BasketballGameDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (force) qs.set("refresh", "true");
  const r = await fetch(`/api/basketball/match-detail/${encodeURIComponent(slug)}?${qs}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Maç detay alınamadı (${r.status})`);
  return (await r.json()) as BasketballGameDetailResponse;
}

export function BasketballDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<BasketballGameDetailResponse>(initial);
  const [tab, setTab] = useState<MatchTabKey>("standings");

  const refresh = useCallback(
    async (force = false) => {
      try {
        const fresh = await fetchClient(slug, lang, force);
        setDetail(fresh);
      } catch {
        // silent
      }
    },
    [slug, lang],
  );

  // Canli macta 25sn'de bir poll. Sport canli WS list-broadcast oldugu icin
  // detay sayfasinda polling kullaniyoruz — basit + guvenilir.
  useEffect(() => {
    if (!isLiveDetail(detail)) return;
    const id = setInterval(() => void refresh(), 25000);
    return () => clearInterval(id);
  }, [detail, refresh]);

  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const tabs: MatchTabDef[] = [
    { key: "standings", label: t("Puan Durumu", "Standings"), icon: <IconTrophy s={14} /> },
    { key: "stats", label: t("İstatistik", "Stats"), icon: <IconBars s={14} /> },
    { key: "h2h", label: "H2H", icon: <IconSwap s={14} /> },
  ];

  return (
    <div className="match-detail-screen">
      <BasketballHero detail={detail} lang={lang} />
      <MatchTabs tabs={tabs} active={tab} onChange={setTab} />
      {/* SEO: paneller sunucu HTML'ine basılır, aktif olmayan `hidden` ile
          gizlenir → Puan Durumu/İstatistik/H2H taranabilir. */}
      <div className="match-detail-body">
        <section role="tabpanel" id="bk-match-panel-standings" hidden={tab !== "standings"}>
          <BasketballStandingsTab detail={detail} lang={lang} />
        </section>
        <section role="tabpanel" id="bk-match-panel-stats" hidden={tab !== "stats"}>
          <BasketballStatsTab detail={detail} lang={lang} />
        </section>
        <section role="tabpanel" id="bk-match-panel-h2h" hidden={tab !== "h2h"}>
          <BasketballH2HTab detail={detail} lang={lang} />
        </section>
      </div>
    </div>
  );
}
