"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

const COL_TR = {
  product: "Urun",
  productItems: [
    { l: "Canli Skor", h: "/" },
    { l: "Ligler", h: "/" },
    { l: "Takimlar", h: "/" },
    { l: "Haberler", h: "/haberler" },
  ],
  company: "Kurumsal",
  companyItems: [
    { l: "Hakkimizda", h: "#" },
    { l: "Iletisim", h: "#" },
    { l: "Reklam", h: "#" },
    { l: "Kariyer", h: "#" },
  ],
  legal: "Yasal",
  legalItems: [
    { l: "Gizlilik", h: "#" },
    { l: "Kullanim Sartlari", h: "#" },
    { l: "Cerez Politikasi", h: "#" },
    { l: "KVKK", h: "#" },
  ],
  social: "Sosyal",
  tagline: "Canli skor, istatistik, dizilis ve daha fazlasi.",
  copy: "Tum haklari saklidir.",
};
const COL_EN = {
  product: "Product",
  productItems: [
    { l: "Live Scores", h: "/" },
    { l: "Leagues", h: "/" },
    { l: "Teams", h: "/" },
    { l: "News", h: "/haberler" },
  ],
  company: "Company",
  companyItems: [
    { l: "About", h: "#" },
    { l: "Contact", h: "#" },
    { l: "Advertise", h: "#" },
    { l: "Careers", h: "#" },
  ],
  legal: "Legal",
  legalItems: [
    { l: "Privacy", h: "#" },
    { l: "Terms of Use", h: "#" },
    { l: "Cookie Policy", h: "#" },
    { l: "GDPR", h: "#" },
  ],
  social: "Social",
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
          <Link href="/" className="site-footer-logo">
            ScoresTV
          </Link>
          <p className="site-footer-tag">{c.tagline}</p>
          <div className="site-footer-social">
            <a href="#" aria-label="X" className="sf-soc">X</a>
            <a href="#" aria-label="Facebook" className="sf-soc">f</a>
            <a href="#" aria-label="Instagram" className="sf-soc">IG</a>
            <a href="#" aria-label="YouTube" className="sf-soc">YT</a>
          </div>
        </div>

        <div className="site-footer-col">
          <h4>{c.product}</h4>
          <ul>
            {c.productItems.map((it) => (
              <li key={it.l}>
                <Link href={it.h}>{it.l}</Link>
              </li>
            ))}
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
      </div>
    </footer>
  );
}
