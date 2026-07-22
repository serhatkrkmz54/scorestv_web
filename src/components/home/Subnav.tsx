"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSportOptional } from "@/context/sport-context";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import type { FixtureDatesResponse } from "@/lib/fixtures-types";
import type { Sport } from "@/lib/sports";
import { rankingsPath, basketballHomePath } from "@/lib/routes";
import { newsListPath } from "@/lib/news-format";
import { IconBars, IconCalendar, IconNews } from "@/components/icons";

export function Subnav() {
  const sportCtx = useSportOptional();
  const pathname = usePathname();
  const { lang } = useLang();
  const t = HOME_STR[lang];

  // Aktif spor artik PATHNAME'e gore belirlenir (sport-context degil):
  //   futbol -> "/" ve "/mac/*" (ve diger futbol rotalari)
  //   basketbol -> "/basketbol*" veya "/basketball*"
  // Voleybol yolu da tespit edilir ki (voleybol mac sayfalarinda) yanlislikla
  // futbol sekmesi "secili" gorunmesin.
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

  // Voleybol web'de PASIF — henuz kategori (landing) sayfasi yok. Menude
  // GORUNUR ama tiklaninca gercek sayfaya gitmek yerine "Yakinda" toast'i
  // gosterir (var olmayan sayfaya link vermek SEO'ya zarar verir). Hazir
  // olunca /voleybol landing + gercek link olarak aktiflenir.
  const [showSoon, setShowSoon] = useState(false);
  const soonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popSoon = useCallback(() => {
    setShowSoon(true);
    if (soonTimer.current) clearTimeout(soonTimer.current);
    soonTimer.current = setTimeout(() => setShowSoon(false), 2200);
  }, []);
  useEffect(
    () => () => {
      if (soonTimer.current) clearTimeout(soonTimer.current);
    },
    [],
  );

  const sports: {
    id: Sport;
    label: string;
    img: string; // public/ altindaki spor ikonu (54px, ~6KB'ye optimize)
    live: number;
    on: boolean; // gercek kategori sayfasi var mi (link) — yoksa "Yakinda"
  }[] = [
    {
      id: "football",
      label: t.football,
      img: "/sport_football.png",
      live: footballLive,
      on: true,
    },
    {
      id: "basketball",
      label: t.basketball,
      img: "/sport_basketball.png",
      live: basketballLive,
      on: true,
    },
    {
      id: "volleyball",
      label: t.volleyball,
      img: "/sport_volleyball.png",
      live: 0,
      on: false,
    },
  ];

  // Gerçek kategori sayfası olan spor: futbol "/", basketbol "/basketbol" |
  // "/basketball".
  function sportHref(id: Sport): string {
    return id === "basketball" ? basketballHomePath(lang) : "/";
  }

  const soonText = lang === "tr" ? "Yakında" : "Coming soon";

  return (
    <nav className="subnav">
      <div className="subnav-in">
        {sports.map((sp) => {
          const selected = sp.on && sp.id === activeSport;
          const className =
            "sport-tab" + (sp.on ? " on" : "") + (selected ? " selected" : "");
          const inner = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- public/ statik spor ikonu */}
              <img
                src={sp.img}
                alt=""
                width={20}
                height={20}
                className="sport-tab-ic"
              />
              <span>{sp.label}</span>
              {sp.live > 0 && <span className="cnt live">{sp.live}</span>}
            </>
          );
          // SEO: kategori sayfası olan sporlar GERÇEK <a href> link (Google
          // takip edebilsin). Spor-context onClick ile senkron tutulur.
          if (sp.on) {
            return (
              <Link
                key={sp.id}
                href={sportHref(sp.id)}
                className={className}
                aria-current={selected ? "page" : undefined}
                onClick={() => sportCtx?.setSport(sp.id)}
              >
                {inner}
              </Link>
            );
          }
          // Pasif spor (voleybol) → tıklanınca "Yakında" toast'ı göster.
          return (
            <button key={sp.id} type="button" className={className} onClick={popSoon}>
              {inner}
            </button>
          );
        })}
        {/* Maç Programı / Sıralamalar / Haberler — MOBİLDE subnav'dan gizlenir
            (sol drawer menüde yer alırlar); sadece spor sekmeleri kalır.
            `.subnav-extra` @media ≤1023.98px'te display:none (hamburger'ın
            göründüğü genişlik). Masaüstünde normal görünür. */}
        <span className="subnav-spacer subnav-extra" />
        <Link href="/canli-mac-programi" className="sport-tab subnav-extra">
          <IconCalendar s={17} />
          <span>{t.tvGuide}</span>
        </Link>
        <Link href={rankingsPath(lang)} className="sport-tab subnav-extra">
          <IconBars s={17} />
          <span>{t.rankings}</span>
        </Link>
        <Link href={newsListPath(lang)} className="sport-tab subnav-extra">
          <IconNews s={17} />
          <span>{t.news}</span>
        </Link>
      </div>
      {showSoon && (
        <div className="subnav-toast" role="status">
          {soonText}
        </div>
      )}
    </nav>
  );
}
