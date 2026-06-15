"use client";

import { useEffect, useRef } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const scroll = (dx: number) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  // Acilista (tarihler gelince) bugun/secili gunu yatay olarak ORTAYA kaydir.
  const didCenter = useRef(false);
  useEffect(() => {
    if (didCenter.current) return;
    const c = ref.current;
    const el = activeRef.current;
    if (!c || !el) return;
    // getBoundingClientRect ile guvenli ortalama (offsetParent'a bagli degil,
    // sayfayi dikey kaydirmaz — yalniz seridi yatay kaydirir).
    const cRect = c.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    c.scrollLeft += (elRect.left - cRect.left) + el.clientWidth / 2 - c.clientWidth / 2;
    didCenter.current = true;
  }, [dates]);

  const dayNum = (iso: string) => {
    const p = iso.split("-");
    return p.length === 3 ? String(Number(p[2])) : iso;
  };

  return (
    <div className="date-strip">
      <button className="date-arrow" onClick={() => scroll(-180)} aria-label="Önceki günler">
        <IconChevronLeft s={16} />
      </button>
      <div className="date-days scroll-x" ref={ref}>
        {dates.map((d) => {
          const isToday = d.date === today;
          const on = d.date === selected;
          const isActive = on || (selected == null && isToday);
          return (
            <button
              key={d.date}
              ref={isActive ? activeRef : null}
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
