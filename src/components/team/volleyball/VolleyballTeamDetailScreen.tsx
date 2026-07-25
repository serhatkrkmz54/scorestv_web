"use client";

import { useState } from "react";
import type { VolleyballTeamDetailResponse } from "@/lib/volleyball-team-types";
import { IconList, IconVolley } from "@/components/icons";
import { VolleyballTeamHero } from "./VolleyballTeamHero";
import {
  VolleyballTeamTabs,
  type VlTeamTabKey,
  type VlTeamTabDef,
} from "./VolleyballTeamTabs";
import { VolleyballTeamOverviewTab } from "./tabs/VolleyballTeamOverviewTab";
import { VolleyballTeamFixturesTab } from "./tabs/VolleyballTeamFixturesTab";

interface Props {
  initial: VolleyballTeamDetailResponse;
  lang: "tr" | "en";
}

function tabDefs(lang: "tr" | "en"): VlTeamTabDef[] {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return [
    { key: "overview", label: t("Genel", "Overview"), icon: <IconList s={14} /> },
    { key: "fixtures", label: t("Fikstür", "Fixtures"), icon: <IconVolley s={14} /> },
  ];
}

// Voleybol takim ekrani — basketbolun LEANER esi: sezon secici yok (backend
// sezon listesi dondurmuyor), kadro/istatistik sekmeleri yok.
export function VolleyballTeamDetailScreen({ initial, lang }: Props) {
  const [tab, setTab] = useState<VlTeamTabKey>("overview");
  const tabs = tabDefs(lang);

  return (
    <div className="team-detail-screen">
      <VolleyballTeamHero detail={initial} lang={lang} />
      <VolleyballTeamTabs tabs={tabs} active={tab} onChange={setTab} />
      {/* SEO: paneller sunucu HTML'ine basılır, aktif olmayan `hidden` ile gizlenir. */}
      <div className="team-detail-body">
        <section role="tabpanel" id="vl-team-panel-overview" hidden={tab !== "overview"}>
          <VolleyballTeamOverviewTab detail={initial} lang={lang} />
        </section>
        <section role="tabpanel" id="vl-team-panel-fixtures" hidden={tab !== "fixtures"}>
          <VolleyballTeamFixturesTab detail={initial} lang={lang} />
        </section>
      </div>
    </div>
  );
}
