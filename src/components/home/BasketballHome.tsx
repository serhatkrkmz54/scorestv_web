"use client";

import { useEffect } from "react";
import { useSportOptional } from "@/context/sport-context";
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
export function BasketballHome() {
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
      <SportFixtures sport="basketball" />
      <aside className="rail-right">
        <BasketballRightRail />
      </aside>
    </div>
  );
}
