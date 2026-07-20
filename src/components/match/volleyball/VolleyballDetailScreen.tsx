"use client";

import { useState, useCallback, useEffect } from "react";
import { VolleyballHero } from "./VolleyballHero";
import { VolleyballStandingsTab } from "./VolleyballStandingsTab";
import { VolleyballH2HTab } from "./VolleyballH2HTab";
import { MatchTabs, type MatchTabDef, type MatchTabKey } from "../MatchTabs";
import type { VolleyballGameDetailResponse } from "@/lib/volleyball-detail-types";
import { IconTrophy, IconSwap } from "@/components/icons";

interface Props {
  initial: VolleyballGameDetailResponse;
  slug: string;
  lang: "tr" | "en";
}

const LIVE = new Set(["S1", "S2", "S3", "S4", "S5", "LIVE"]);

function isLiveDetail(d: VolleyballGameDetailResponse): boolean {
  return LIVE.has(d.status?.shortName ?? "");
}

async function fetchClient(
  slug: string,
  lang: "tr" | "en",
  force = false,
): Promise<VolleyballGameDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (force) qs.set("refresh", "true");
  const r = await fetch(`/api/volleyball/match-detail/${encodeURIComponent(slug)}?${qs}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Maç detay alınamadı (${r.status})`);
  return (await r.json()) as VolleyballGameDetailResponse;
}

export function VolleyballDetailScreen({ initial, slug, lang }: Props) {
  const [detail, setDetail] = useState<VolleyballGameDetailResponse>(initial);
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

  useEffect(() => {
    if (!isLiveDetail(detail)) return;
    const id = setInterval(() => void refresh(), 25000);
    return () => clearInterval(id);
  }, [detail, refresh]);

  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const tabs: MatchTabDef[] = [
    { key: "standings", label: t("Puan Durumu", "Standings"), icon: <IconTrophy s={14} /> },
    { key: "h2h", label: "H2H", icon: <IconSwap s={14} /> },
  ];

  return (
    <div className="match-detail-screen">
      <VolleyballHero detail={detail} lang={lang} />
      <MatchTabs tabs={tabs} active={tab} onChange={setTab} />
      {/* SEO: paneller sunucu HTML'ine basılır, aktif olmayan `hidden` ile
          gizlenir → Puan Durumu/H2H taranabilir. */}
      <div className="match-detail-body">
        <section role="tabpanel" id="vb-match-panel-standings" hidden={tab !== "standings"}>
          <VolleyballStandingsTab detail={detail} lang={lang} />
        </section>
        <section role="tabpanel" id="vb-match-panel-h2h" hidden={tab !== "h2h"}>
          <VolleyballH2HTab detail={detail} lang={lang} />
        </section>
      </div>
    </div>
  );
}
