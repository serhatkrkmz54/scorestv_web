"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSportOptional } from "@/context/sport-context";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import type { FixtureDatesResponse } from "@/lib/fixtures-types";
import type { Sport } from "@/lib/sports";
import { rankingsPath, basketballHomePath } from "@/lib/routes";
import { newsListPath } from "@/lib/news-format";
import {
  IconBall,
  IconBars,
  IconBasket,
  IconCalendar,
  IconNews,
  IconTennis,
  IconVolley,
} from "@/components/icons";

export function Subnav() {
  const sportCtx = useSportOptional();
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();
  const t = HOME_STR[lang];

  // Aktif spor artik PATHNAME'e gore belirlenir (sport-context degil):
  //   futbol -> "/" ve "/mac/*" (ve diger futbol rotalari)
  //   basketbol -> "/basketbol*" veya "/basketball*"
  const activeSport: Sport = useMemo(() => {
    const p = pathname ?? "/";
    if (p.startsWith("/basketbol") || p.startsWith("/basketball")) return "basketball";
    if (p.startsWith("/voleybol") || p.startsWith("/volleyball")) return "volleyball";
    return "football";
  }, [pathname]);

  // Canli mac sayisi badge'leri — her spor KENDI canli sayisini gosterir ve
  // aktif sekmeye BAGLI DEGILDIR (basketbola gecince futbol badge'i kaybolmaz,
  // basketbol da kendi canli sayisini gosterir). Bugunun canli sayisi 60sn'de
  // bir tazelenir.
  const [footballLive, setFootballLive] = useState(0);
  const [basketballLive, setBasketballLive] = useState(0);

  useEffect(() => {
    let aborted = false;
    const load = async () => {
      try {
        const r = await fetch(`/api/fixtures/dates?days=1&lang=${lang}`, {
          cache: "no-store",
        });
        if (r.ok) {
          const data = (await r.json()) as FixtureDatesResponse;
          const today =
            data.dates.find((d) => d.date === data.today) ?? data.dates[0] ?? null;
          if (!aborted) setFootballLive(today?.liveCount ?? 0);
        }
      } catch {
        /* sessiz */
      }
      try {
        const r = await fetch(`/api/basketball/fixtures?status=live&lang=${lang}`, {
          cache: "no-store",
        });
        if (r.ok) {
          const data = (await r.json()) as { liveCount?: number };
          if (!aborted) setBasketballLive(data.liveCount ?? 0);
        }
      } catch {
        /* sessiz */
      }
    };
    void load();
    const id = setInterval(() => void load(), 60000);
    return () => {
      aborted = true;
      clearInterval(id);
    };
  }, [lang]);

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
    { id: "football", label: t.football, Icon: IconBall, live: footballLive, on: true },
    {
      id: "basketball",
      label: t.basketball,
      Icon: IconBasket,
      live: basketballLive,
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
        <Link href="/canli-mac-programi" className="sport-tab">
          <IconCalendar s={17} />
          <span>{t.tvGuide}</span>
        </Link>
        <Link href={rankingsPath(lang)} className="sport-tab">
          <IconBars s={17} />
          <span>{t.rankings}</span>
        </Link>
        <Link href={newsListPath(lang)} className="sport-tab">
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
