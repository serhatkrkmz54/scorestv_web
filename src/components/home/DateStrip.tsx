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
  // Ilk (cold) ziyarette sorun: Rajdhani fontu `display: swap` ile sonradan
  // yukleniyor; efekt yedek font genisligiyle olcup ortaliyor, gercek font
  // gelince gun genislikleri degisiyor ve secili tarih ortadan kaciyordu.
  // Cozum: layout/paint otursun diye rAF ile olc + `document.fonts.ready`
  // sonrasi yeniden ortala. Konteyner henuz olculmediyse (genislik 0) erteler.
  const didCenter = useRef(false);
  useEffect(() => {
    if (didCenter.current) return;
    if (!dates.length) return;
    let cancelled = false;

    const center = (): boolean => {
      const c = ref.current;
      const el = activeRef.current;
      if (!c || !el || c.clientWidth === 0) return false;
      // getBoundingClientRect ile guvenli ortalama (offsetParent'a bagli degil,
      // sayfayi dikey kaydirmaz — yalniz seridi yatay kaydirir).
      const cRect = c.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const delta = elRect.left - cRect.left + el.clientWidth / 2 - c.clientWidth / 2;
      const max = c.scrollWidth - c.clientWidth;
      const next = Math.max(0, Math.min(c.scrollLeft + delta, max));
      // CSS `scroll-behavior: smooth` animasyonunu gecici kapat — anlik otursun.
      const prevBehavior = c.style.scrollBehavior;
      c.style.scrollBehavior = "auto";
      c.scrollLeft = next;
      c.style.scrollBehavior = prevBehavior;
      return true;
    };

    // Layout/paint oturduktan sonra olc (iki rAF).
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!cancelled && center()) didCenter.current = true;
      });
    });

    // Web font yuklenince genislikler degisir → yeniden ortala (ilk ziyaret kritik).
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!cancelled && center()) didCenter.current = true;
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
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
