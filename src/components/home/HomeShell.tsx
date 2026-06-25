"use client";

import type { ReactNode } from "react";
import { useSportOptional } from "@/context/sport-context";

// Futbol → 3 kolon (sol/sag rail futbol icerikli, DEGISMEDEN).
// Basketbol/voleybol → rail'ler futbola ait oldugu icin GIZLENIR (yanlis lig
// tiklamasini onler) ve ana kolon tam genisler.
export function HomeShell({
  left,
  right,
  children,
}: {
  left: ReactNode;
  right: ReactNode;
  children: ReactNode;
}) {
  const ctx = useSportOptional();
  const sport = ctx?.sport ?? "football";
  if (sport !== "football") {
    return <div className="layout layout-solo">{children}</div>;
  }
  return (
    <div className="layout">
      <aside className="rail-left">{left}</aside>
      {children}
      <aside className="rail-right">{right}</aside>
    </div>
  );
}
