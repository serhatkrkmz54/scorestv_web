import Link from "next/link";
import type { Lang } from "@/i18n/auth-strings";
import type { NewsListItem } from "@/lib/news-types";
import {
  categoryLabel,
  formatNewsDate,
  newsPath,
  readingLabel,
} from "@/lib/news-format";
import { colorFromName } from "@/lib/fixtures";

// Haber kartı — liste sayfası grid'i. Sunucu bileşeni (link + statik render).
// Kapak görseli yoksa isimden turetilen renkli placeholder + kategori baş harfi.
export function NewsCard({
  item,
  lang,
}: {
  item: NewsListItem;
  lang: Lang;
}) {
  const cat = categoryLabel(item.category, lang);
  const date = formatNewsDate(item.publishedAt, lang);
  const reading = readingLabel(item.readingMinutes, lang);
  const breakingLabel = lang === "tr" ? "Son Dakika" : "Breaking";
  return (
    <Link href={newsPath(lang, item.slug)} className="news-card">
      <div className="news-card-cover">
        {item.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverImageUrl} alt="" loading="lazy" />
        ) : (
          <span
            className="news-card-cover-fallback"
            style={{ background: colorFromName(item.title) }}
          >
            {cat.charAt(0)}
          </span>
        )}
        {item.isBreaking ? (
          <span className="news-chip news-chip-breaking">{breakingLabel}</span>
        ) : null}
      </div>
      <div className="news-card-body">
        <span className="news-card-cat">{cat}</span>
        <h3 className="news-card-title">{item.title}</h3>
        {item.summary ? (
          <p className="news-card-summary">{item.summary}</p>
        ) : null}
        <div className="news-card-meta">
          {date ? <span>{date}</span> : null}
          {reading ? <span>· {reading}</span> : null}
        </div>
      </div>
    </Link>
  );
}
