"use client";

import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import type { StatusFilter } from "@/lib/fixtures-types";
import { IconStar } from "@/components/icons";
import { SettingsMenu } from "./SettingsMenu";

export interface StatusCounts {
  all: number;
  fav: number;
  live: number;
  upcoming: number;
  finished: number;
}

export function StatusChips({
  counts,
  status,
  onChange,
}: {
  counts: StatusCounts;
  status: StatusFilter;
  onChange: (s: StatusFilter) => void;
}) {
  const { lang } = useLang();
  const t = HOME_STR[lang];

  const chips: { id: StatusFilter; label: string; n: number; live?: boolean; fav?: boolean }[] = [
    // Favoriler en başta, yalnızca favori maç varsa (eklenince anında belirir).
    ...(counts.fav > 0
      ? [{ id: "fav" as StatusFilter, label: t.favorites, n: counts.fav, fav: true }]
      : []),
    { id: "all", label: t.all, n: counts.all },
    { id: "live", label: t.live, n: counts.live, live: true },
    { id: "upcoming", label: t.upcoming, n: counts.upcoming },
    { id: "finished", label: t.finished, n: counts.finished },
  ];

  return (
    <div className="chips-row">
      <div className="chips">
        {chips.map((c) => (
          <button
            key={c.id}
            className={"chip" + (status === c.id ? " on" : "")}
            onClick={() => onChange(c.id)}
          >
            {c.fav && <IconStar s={13} fill={status === c.id ? "currentColor" : "none"} />}
            {c.live && c.n > 0 && <span className="dot" />}
            {c.label}
            <span className={"cn" + (c.live && c.n > 0 ? " live" : "")}>{c.n}</span>
          </button>
        ))}
      </div>
      <SettingsMenu />
    </div>
  );
}
