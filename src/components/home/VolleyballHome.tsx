"use client";

import { useEffect } from "react";
import { useSportOptional } from "@/context/sport-context";
import type { FixtureDatesResponse } from "@/lib/fixtures-types";
import type { SportDayResponse } from "@/lib/sport-scores-types";
import { VolleyballLeftRail } from "./VolleyballLeftRail";
import { VolleyballRightRail } from "./VolleyballRightRail";
import { SportFixtures } from "./SportFixtures";

/**
 * Voleybol anasayfasi (client kabugu) — basketbol {@link BasketballHome}'un
 * voleybol esi. Sol = voleybol sol ray, orta = voleybol fikstur feed'i
 * (SportFixtures sport="volleyball"), sag = voleybol sag ray.
 */
export function VolleyballHome({
  initialDates = null,
  initialDay = null,
  initialDate = null,
}: {
  // SSR tohumu — sunucudan gelen ilk gün maçları (Google ilk HTML'de görsün).
  initialDates?: FixtureDatesResponse | null;
  initialDay?: SportDayResponse | null;
  initialDate?: string | null;
} = {}) {
  const sportCtx = useSportOptional();
  useEffect(() => {
    sportCtx?.setSport("volleyball");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="layout">
      <aside className="rail-left">
        <VolleyballLeftRail />
      </aside>
      <SportFixtures
        sport="volleyball"
        initialDates={initialDates}
        initialDay={initialDay}
        initialDate={initialDate}
      />
      <aside className="rail-right">
        <VolleyballRightRail />
      </aside>
    </div>
  );
}
