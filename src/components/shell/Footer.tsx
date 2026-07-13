"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { leaguePath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import { StoreBadges } from "@/components/download/StoreBadges";
import { Logo } from "./Logo";

// ---------------------------------------------------------------------------
// Popüler ligler — footer "Popüler Ligler" kolonu. id = API-Football lig id'si;
// link uygulama içi lig sayfasina gider (leaguePath + slug).
// ---------------------------------------------------------------------------
const LEAGUES: { tr: string; en: string; id: number }[] = [
  { tr: "Süper Lig", en: "Süper Lig", id: 203 },
  { tr: "Premier League", en: "Premier League", id: 39 },
  { tr: "La Liga", en: "La Liga", id: 140 },
  { tr: "Şampiyonlar Ligi", en: "Champions League", id: 2 },
];

// ---------------------------------------------------------------------------
// Sosyal medya hesaplari. URL'leri buraya yapistir (su an placeholder "#").
// ---------------------------------------------------------------------------
const SOCIALS: { key: string; label: string; href: string; icon: React.ReactNode }[] = [
  {
    key: "x",
    label: "X",
    href: "#", // TODO: X (Twitter) profil URL'si
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "#", // TODO: Instagram profil URL'si
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "#", // TODO: YouTube kanal URL'si
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    href: "#", // TODO: Facebook sayfa URL'si
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

const COL_TR = {
  leagues: "Popüler Ligler",
  company: "Kurumsal",
  companyItems: [
    { l: "Hakkımızda", h: "/hakkimizda" },
    { l: "İletişim", h: "/iletisim" },
    { l: "Reklam", h: "/reklam" },
    { l: "Kariyer", h: "/kariyer" },
  ],
  legal: "Yasal",
  legalItems: [
    { l: "Gizlilik", h: "/gizlilik" },
    { l: "Kullanım Şartları", h: "/kullanim-sartlari" },
    { l: "Çerez Politikası", h: "/cerez-politikasi" },
    { l: "KVKK", h: "/kvkk" },
  ],
  social: "Bizi takip edin",
  app: "Uygulamayı indir",
  tagline: "Canlı skor, istatistik, diziliş ve daha fazlası.",
  copy: "Tüm hakları saklıdır.",
};
const COL_EN = {
  leagues: "Popular Leagues",
  company: "Company",
  companyItems: [
    { l: "About", h: "/hakkimizda" },
    { l: "Contact", h: "/iletisim" },
    { l: "Advertise", h: "/reklam" },
    { l: "Careers", h: "/kariyer" },
  ],
  legal: "Legal",
  legalItems: [
    { l: "Privacy", h: "/gizlilik" },
    { l: "Terms of Use", h: "/kullanim-sartlari" },
    { l: "Cookie Policy", h: "/cerez-politikasi" },
    { l: "GDPR / KVKK", h: "/kvkk" },
  ],
  social: "Follow us",
  app: "Get the app",
  tagline: "Live scores, stats, lineups and more.",
  copy: "All rights reserved.",
};

export function Footer() {
  const { lang } = useLang();
  const c = lang === "tr" ? COL_TR : COL_EN;
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link href="/" className="site-footer-logo" aria-label="ScoresTV">
            <Logo h={30} />
          </Link>
          <p className="site-footer-tag">{c.tagline}</p>
          <span className="site-footer-social-label">{c.social}</span>
          <div className="site-footer-social">
            {SOCIALS.map((s) => (
              <a
                key={s.key}
                href={s.href}
                aria-label={s.label}
                title={s.label}
                className={`sf-soc sf-${s.key}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <span className="site-footer-social-label site-footer-app-label">{c.app}</span>
          <StoreBadges className="site-footer-apps" />
        </div>

        <div className="site-footer-col">
          <h4>{c.leagues}</h4>
          <ul>
            {LEAGUES.map((lg) => {
              const name = lang === "tr" ? lg.tr : lg.en;
              return (
                <li key={lg.id}>
                  <Link href={leaguePath(lang, buildEntitySlug(name, lg.id))}>
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="site-footer-col">
          <h4>{c.company}</h4>
          <ul>
            {c.companyItems.map((it) => (
              <li key={it.l}>
                <Link href={it.h}>{it.l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer-col">
          <h4>{c.legal}</h4>
          <ul>
            {c.legalItems.map((it) => (
              <li key={it.l}>
                <Link href={it.h}>{it.l}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {year} ScoresTV. {c.copy}</span>
        {/* Sadece botlar/crawler icin — gorsel olarak gizli (sr-only), DOM'da var. */}
        <a href="/sitemap.xml" className="sr-only">Sitemap</a>
      </div>
    </footer>
  );
}
