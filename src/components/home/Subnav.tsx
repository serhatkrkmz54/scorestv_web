"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useHomeOptional } from "@/context/home-context";
import { useSportOptional } from "@/context/sport-context";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import type { FixtureDatesResponse } from "@/lib/fixtures-types";
import type { Sport } from "@/lib/sports";
import { rankingsPath, basketballHomePath } from "@/lib/routes";
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
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();
  const t = HOME_STR[lang];

  // Aktif spor artik PATHNAME'e gore belirlenir (sport-context degil):
  //   futbol → "/" ve "/mac/*" (ve diger futbol rotalari)
  //   basketbol → "/basketbol*" veya "/basketball*"
  const activeSport: Sport = useMemo(() => {
    const p = pathname ?? "/";
    if (p.startsWith("/basketbol") || p.startsWith("/basketball")) return "basketball";
    if (p.startsWith("/voleybol") || p.startsWith("/volleyball")) return "volleyball";
    return "football";
  }, [pathname]);

  const ctxDate = home?.selectedDate ?? null;
  const ctxCount = home?.day?.fixtureCount ?? null;

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
    if (activeSport !== "football") return 0;
    if (ctxCount != null) return ctxCount;
    if (fallback) return fallback.count;
    return 0;
  }, [ctxCount, fallback, activeSport]);

  // GECICI: "cok yakinda" toast'i (yalnizca voleybol gibi henuz acilmamis
  // sporlar icin; backend canliya alininca comingSoon:false yap).
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  const sports: {
    id: Sport | "tennis";
    label: string;
    Icon: typeof IconBall;
    live: number;
    on: boolean;
    comingSoon?: boolean;
  }[] = [
    { id: "football", label: t.football, Icon: IconBall, live: dayCount, on: true },
    {
      id: "basketball",
      label: t.basketball,
      Icon: IconBasket,
      live: 0,
      on: true,
    },
    {
      id: "volleyball",
      label: t.volleyball,
      Icon: IconVolley,
      live: 0,
      on: true,
      comingSoon: true,
    },
    { id: "tennis", label: t.tennis, Icon: IconTennis, live: 0, on: false },
  ];

  // Sekmeye tiklayinca: o sporun KENDI URL'ine git (futbol "/", basketbol
  // "/basketbol" | "/basketball"). Spor-context de senkron tutulur.
  function pickSport(id: Sport) {
    if (sportCtx) sportCtx.setSport(id);
    if (id === "basketball") {
      router.push(basketballHomePath(lang));
    } else {
      router.push("/");
    }
  }

  return (
    <nav className="subnav">
      <div className="subnav-in">
        {sports.map((sp) => {
          const isSport = sp.id !== "tennis";
          const selected = isSport && !sp.comingSoon && sp.id === activeSport;
          return (
            <button
              key={sp.id}
              type="button"
              className={"sport-tab" + (sp.on ? " on" : "") + (selected ? " selected" : "")}
              disabled={!sp.on}
              onClick={() => {
                if (!sp.on || !isSport) return;
                if (sp.comingSoon) {
                  showToast(
                    `${sp.label} ${lang === "tr" ? "çok yakında" : "coming soon"}`,
                  );
                  return;
                }
                pickSport(sp.id as Sport);
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
      {toast ? (
        <div className="subnav-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </nav>
  );
}
