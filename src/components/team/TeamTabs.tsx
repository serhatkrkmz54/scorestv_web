"use client";

import { useRef, useEffect, type ReactNode } from "react";

export type TeamTabKey =
  | "overview"
  | "squad"
  | "fixtures"
  | "standings"
  | "transfers"
  | "stats";

export interface TeamTabDef {
  key: TeamTabKey;
  label: string;
  icon?: ReactNode;
}

interface Props {
  tabs: TeamTabDef[];
  active: TeamTabKey;
  onChange: (k: TeamTabKey) => void;
}

export function TeamTabs({ tabs, active, onChange }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = refs.current[active];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <nav className="match-tabs" role="tablist">
      <div className="match-tabs-scroll">
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
