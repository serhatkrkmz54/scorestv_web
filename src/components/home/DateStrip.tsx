"use client";

import { useRef } from "react";
import { useLang } from "@/context/lang-context";
import type { DateEntry } from "@/lib/fixtures-types";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

export function DateStrip({
  dates,
  today,
  selected,
  onSelect,
}: {
  dates: DateEntry[];
  today: string;
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dx: number) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  const dayNum = (iso: string) => {
    const p = iso.split("-");
    return p.length === 3 ? String(Number(p[2])) : iso;
  };

  return (
    <div className="date-strip">
      <button className="date-arrow" onClick={() => scroll(-180)} aria-label="Önceki günler">
        <IconChevronLeft s={16} />
      </button>
      <button
        type="button"
        className={"date-today" + (selected === today ? " on" : "")}
        onClick={() => onSelect(today)}
      >
        {lang === "tr" ? "Bugün" : "Today"}
      </button>
      <div className="date-days scroll-x" ref={ref}>
        {dates.map((d) => {
          const isToday = d.date === today;
          const on = d.date === selected;
          return (
            <button
              key={d.date}
              className={"date-day" + (isToday ? " today" : "") + (on ? " on" : "")}
              onClick={() => onSelect(d.date)}
            >
              <span className="wd">{d.dayName}</span>
              <span className="dn tnum">{dayNum(d.date)}</span>
            </button>
          );
        })}
      </div>
      <button className="date-arrow" onClick={() => scroll(180)} aria-label="Sonraki günler">
        <IconChevronRight s={16} />
      </button>
    </div>
  );
}
