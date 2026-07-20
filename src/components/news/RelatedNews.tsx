import Link from "next/link";
import type { Lang } from "@/i18n/auth-strings";
import type { NewsListItem } from "@/lib/news-types";
import {
  categoryLabel,
  formatRelativeTime,
  newsPath,
} from "@/lib/news-format";
import { colorFromName } from "@/lib/fixtures";

// İlgili Haberler — takım/lig/oyuncu detay sayfaları + haber detay sayfası.
// Sunucu bileşeni; önceden çekilmiş liste verilir. Boşsa hiçbir şey render
// etmez (page tarafı zaten kontrol eder ama savunma amaçlı burada da yok).
export function RelatedNews({
  items,
  lang,
  title,
}: {
  items: NewsListItem[];
  lang: Lang;
  title?: string;
}) {
  if (!items || items.length === 0) return null;
  const heading = title ?? (lang === "tr" ? "İlgili Haberler" : "Related News");
  return (
    <section className="related-news">
      <div className="related-news-head">
        <h2>{heading}</h2>
      </div>
      <div className="related-news-list">
        {items.map((n) => {
          const cat = categoryLabel(n.category, lang);
          return (
            <Link
              key={n.id}
              href={newsPath(lang, n.slug)}
              className="related-news-item"
            >
              <span className="related-news-thumb">
                {n.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.coverImageUrl} alt={n.title} loading="lazy" />
                ) : (
                  <span
                    className="related-news-thumb-fb"
                    style={{ background: colorFromName(n.title) }}
                  >
                    {cat.charAt(0)}
                  </span>
                )}
              </span>
              <span className="related-news-body">
                <span className="related-news-title">{n.title}</span>
                <span className="related-news-meta">
                  {cat} · {formatRelativeTime(n.publishedAt, lang)}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
