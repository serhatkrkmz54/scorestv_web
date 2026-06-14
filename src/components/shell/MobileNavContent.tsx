"use client";

/**
 * MobileNavContent — drawer'in icerigi.
 *
 * Icerik:
 *   1) Hizli linkler (Anasayfa, Sıralamalar, Haberler)
 *   2) LeftRail (popular leagues + countries) — anasayfa'daki ile ayni
 *
 * Drawer her sayfada gorunur, navigation icin merkezi nokta.
 */

import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { rankingsPath } from "@/lib/routes";
import { LeftRail } from "@/components/home/LeftRail";
import { IconBall, IconBars, IconHome, IconNews } from "@/components/icons";

export function MobileNavContent() {
  const { lang } = useLang();
  const t = HOME_STR[lang];

  return (
    <>
      <div className="mn-quick">
        <Link href="/" className="mn-quick-item">
          <IconHome s={18} />
          <span>{t.football}</span>
        </Link>
        <Link href={rankingsPath(lang)} className="mn-quick-item">
          <IconBars s={18} />
          <span>{t.rankings}</span>
        </Link>
        <Link href="/haberler" className="mn-quick-item">
          <IconNews s={18} />
          <span>{t.news}</span>
        </Link>
      </div>

      <LeftRail />

      <div className="mn-footer">
        <IconBall s={14} />
        <span>ScoresTV © {new Date().getFullYear()}</span>
      </div>
    </>
  );
}
