"use client";

import { useRef, useEffect, type ReactNode } from "react";

export type MatchTabKey =
  | "highlights"
  | "overview"
  | "stats"
  | "lineups"
  | "standings"
  | "h2h"
  | "prediction"
  | "odds"
  | "injuries"
  | "comments";

export interface MatchTabDef {
  key: MatchTabKey;
  label: string;
  icon?: ReactNode;
}

interface Props {
  tabs: MatchTabDef[];
  active: MatchTabKey;
  onChange: (k: MatchTabKey) => void;
}

export function MatchTabs({ tabs, active, onChange }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = refs.current[active];
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    // SADECE tab seridini kaydir. scrollIntoView TUM kaydirilabilir ust
    // ogeleri (sayfa/body dahil) kaydirdigi icin, sayfada minik bir yatay
    // tasma oldugunda mobilde tum sayfa saga kayip geri gelmiyordu. Burada
    // yalnizca container'in scrollLeft'ini ayarlayarak pill'i ortalariz.
    const elRect = el.getBoundingClientRect();
    const scRect = scroller.getBoundingClientRect();
    const delta =
      elRect.left - scRect.left - (scroller.clientWidth - el.clientWidth) / 2;
    scroller.scrollTo({ left: scroller.scrollLeft + delta, behavior: "smooth" });
  }, [active]);

  return (
    <nav className="match-tabs" role="tablist">
      <div className="match-tabs-scroll" ref={scrollerRef}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                refs.current[tab.key] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`match-tab-pill ${isActive ? "is-active" : ""}`}
              onClick={() => onChange(tab.key)}
            >
              {tab.icon ? <span className="match-tab-icon">{tab.icon}</span> : null}
              <span className="match-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
