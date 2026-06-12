"use client";

import Link from "next/link";
import { useHome } from "@/context/home-context";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import {
  IconBall,
  IconBasket,
  IconNews,
  IconTennis,
  IconVolley,
} from "@/components/icons";

export function Subnav() {
  const { liveFixtures } = useHome();
  const { lang } = useLang();
  const t = HOME_STR[lang];

  const sports = [
    { id: "football", label: t.football, Icon: IconBall, live: liveFixtures.length, on: true },
    { id: "basketball", label: t.basketball, Icon: IconBasket, live: 0, on: false },
    { id: "tennis", label: t.tennis, Icon: IconTennis, live: 0, on: false },
    { id: "volleyball", label: t.volleyball, Icon: IconVolley, live: 0, on: false },
  ];

  return (
    <nav className="subnav">
      <div className="subnav-in">
        {sports.map((sp) => (
          <button key={sp.id} type="button" className={"sport-tab" + (sp.on ? " on" : "")}>
            <sp.Icon s={17} />
            <span>{sp.label}</span>
            {sp.live > 0 && <span className="cnt live">{sp.live}</span>}
          </button>
        ))}
        <span className="subnav-spacer" />
        <Link href="/haberler" className="sport-tab">
          <IconNews s={17} />
          <span>{t.news}</span>
        </Link>
      </div>
    </nav>
  );
}
