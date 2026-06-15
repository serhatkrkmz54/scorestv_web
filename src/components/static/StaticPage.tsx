"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

export interface StaticSection {
  /** Bölüm başlığı */
  h: string;
  /** Paragraflar */
  body: string[];
  /** Opsiyonel madde listesi (başlığın altında) */
  list?: string[];
}

export interface StaticContent {
  title: string;
  /** Sayfa girişi (özet) */
  intro?: string;
  sections: StaticSection[];
  /** Opsiyonel son güncelleme etiketi (yasal sayfalar için) */
  updated?: string;
}

/**
 * Footer'daki bilgi/yasal sayfalar için ortak şablon. İçerik TR/EN olarak
 * dışarıdan verilir; aktif dile göre biri render edilir.
 */
export function StaticPage({ tr, en }: { tr: StaticContent; en: StaticContent }) {
  const { lang } = useLang();
  const c = lang === "tr" ? tr : en;
  return (
    <div className="static-page">
      <article className="static-page-inner">
        <nav className="static-breadcrumb" aria-label="breadcrumb">
          <Link href="/">{lang === "tr" ? "Ana sayfa" : "Home"}</Link>
          <span aria-hidden="true">/</span>
          <span className="cur">{c.title}</span>
        </nav>

        <h1>{c.title}</h1>
        {c.updated && <p className="static-updated">{c.updated}</p>}
        {c.intro && <p className="static-intro">{c.intro}</p>}

        {c.sections.map((s, i) => (
          <section className="static-section" key={i}>
            <h2>{s.h}</h2>
            {s.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {s.list && (
              <ul>
                {s.list.map((li, k) => (
                  <li key={k}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
