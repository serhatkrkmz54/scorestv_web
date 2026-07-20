"use client";

import { useEffect } from "react";
import { useSportOptional } from "@/context/sport-context";
import type { FixtureDatesResponse } from "@/lib/fixtures-types";
import type { SportDayResponse } from "@/lib/sport-scores-types";
import { BasketballLeftRail } from "./BasketballLeftRail";
import { BasketballRightRail } from "./BasketballRightRail";
import { SportFixtures } from "./SportFixtures";

/**
 * Basketbol anasayfasi (client kabugu) — futbol home .layout grid'inin
 * basketbol esi. Sol = basketbol sol ray, orta = basketbol fikstur feed'i
 * (SportFixtures sport="basketball"), sag = basketbol sag ray.
 *
 * Secili sporu "basketball"e cevirir (Header/mobil nav tutarliligi icin);
 * Subnav underline'i artik pathname'e bakar, bu yuzden gorsel secim de dogru.
 */
export function BasketballHome({
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
    sportCtx?.setSport("basketball");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="layout">
      <aside className="rail-left">
        <BasketballLeftRail />
      </aside>
      <SportFixtures
        sport="basketball"
        initialDates={initialDates}
        initialDay={initialDay}
        initialDate={initialDate}
      />
      <aside className="rail-right">
        <BasketballRightRail />
      </aside>
    </div>
  );
}
