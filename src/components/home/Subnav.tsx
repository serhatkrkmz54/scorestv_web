"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useHomeOptional } from "@/context/home-context";
import { useSportOptional } from "@/context/sport-context";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import type { FixtureDatesResponse } from "@/lib/fixtures-types";
import type { Sport } from "@/lib/sports";
import { rankingsPath } from "@/lib/routes";
import {
  IconBall,
  IconBars,
  IconBasket,
  IconNews,
  IconTennis,
  IconVolley,
} from "@/components/icons";

export function Subnav() {
  const home = useHomeOptional();
  const sportCtx = useSportOptional();
  const { lang } = useLang();
  const t = HOME_STR[lang];

  const activeSport: Sport = sportCtx?.sport ?? "football";

  // 1) HomeContext varsa selectedDate'i ve day.fixtureCount'i oncelikli kullan.
  const ctxDate = home?.selectedDate ?? null;
  const ctxCount = home?.day?.fixtureCount ?? null;

  // 2) HomeContext yoksa veya count gelmediyse, bagimsiz fetch.
  const [fallback, setFallback] = useState<{
    date: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (ctxCount != null && ctxDate != null) return;
    let aborted = false;
    fetch(`/api/fixtures/dates?days=1&lang=${lang}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<FixtureDatesResponse>) : null))
      .then((data) => {
        if (aborted || !data) return;
        const todayEntry =
          data.dates.find((d) => d.date === data.today) ?? data.dates[0] ?? null;
        if (todayEntry) {
          setFallback({ date: todayEntry.date, count: todayEntry.fixtureCount });
        }
      })
      .catch(() => {});
    return () => {
      aborted = true;
    };
  }, [ctxCount, ctxDate, lang]);

  const dayCount = useMemo(() => {
    if (ctxCount != null) return ctxCount;
    if (fallback) return fallback.count;
    return 0;
  }, [ctxCount, fallback]);

  // Canli sayisi yalnizca futbol tab'inda gosteriliyor (futbol day count'undan).
  // Basketbol/voleybol canli rozeti anasayfa feed'inden ayrica gosterilebilir;
  // burada sade tutuyoruz.
  const sports: {
    id: Sport | "tennis";
    label: string;
    Icon: typeof IconBall;
    live: number;
    on: boolean;
  }[] = [
    { id: "football", label: t.football, Icon: IconBall, live: dayCount, on: true },
    { id: "basketball", label: t.basketball, Icon: IconBasket, live: 0, on: true },
    { id: "volleyball", label: t.volleyball, Icon: IconVolley, live: 0, on: true },
    { id: "tennis", label: t.tennis, Icon: IconTennis, live: 0, on: false },
  ];

  return (
    <nav className="subnav">
      <div className="subnav-in">
        {sports.map((sp) => {
          const isSport = sp.id !== "tennis";
          const selected = isSport && sp.id === activeSport;
          return (
            <button
              key={sp.id}
              type="button"
              className={"sport-tab" + (sp.on ? " on" : "") + (selected ? " selected" : "")}
              disabled={!sp.on}
              onClick={() => {
                if (sp.on && isSport && sportCtx) sportCtx.setSport(sp.id as Sport);
              }}
            >
              <sp.Icon s={17} />
              <span>{sp.label}</span>
              {sp.live > 0 && <span className="cnt live">{sp.live}</span>}
            </button>
          );
        })}
        <span className="subnav-spacer" />
        <Link href={rankingsPath(lang)} className="sport-tab">
          <IconBars s={17} />
          <span>{t.rankings}</span>
        </Link>
        <Link href="/haberler" className="sport-tab">
          <IconNews s={17} />
          <span>{t.news}</span>
        </Link>
      </div>
    </nav>
  );
}
