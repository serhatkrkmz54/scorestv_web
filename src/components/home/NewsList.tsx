"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { colorFromName } from "@/lib/fixtures";
import type { NewsListItem } from "@/lib/news-types";
import {
  categoryLabel,
  formatRelativeTime,
  newsListPath,
  newsPath,
} from "@/lib/news-format";

// Anasayfa sağ ray haber listesi — gerçek son haberlerle beslenir (SSR'de
// çekilip prop olarak gelir). Boşsa hiç render edilmez (rail sadeleşsin).
export function NewsList({ items }: { items: NewsListItem[] }) {
  const { lang } = useLang();
  const t = HOME_STR[lang];

  if (!items || items.length === 0) return null;

  return (
    <div className="rl-section">
      <div className="card-head">
        <h3>{t.news}</h3>
        <Link href={newsListPath(lang)} className="nl-all">
          {lang === "tr" ? "Tümü" : "All"}
        </Link>
      </div>
      {items.map((n) => (
        <Link className="nl-item" key={n.id} href={newsPath(lang, n.slug)}>
          {n.coverImageUrl ? (
            <span className="nl-thumb nl-thumb-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={n.coverImageUrl} alt="" loading="lazy" />
            </span>
          ) : (
            <span
              className="nl-thumb"
              style={{ background: colorFromName(n.title) }}
            >
              {categoryLabel(n.category, lang).charAt(0)}
            </span>
          )}
          <div className="nl-body">
            <div className="nl-title">{n.title}</div>
            <div className="nl-meta">
              {categoryLabel(n.category, lang)} ·{" "}
              {formatRelativeTime(n.publishedAt, lang)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
