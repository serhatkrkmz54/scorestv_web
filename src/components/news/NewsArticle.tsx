import Link from "next/link";
import type { Lang } from "@/i18n/auth-strings";
import type { NewsDetail, NewsEntityRef, NewsListItem } from "@/lib/news-types";
import {
  formatNewsDate,
  newsListPath,
  newsPath,
  readingLabel,
} from "@/lib/news-format";
import { buildEntitySlug } from "@/lib/slug-utils";
import { teamPath, leaguePath, playerPath } from "@/lib/routes";
import { NewsShare } from "./NewsShare";
import { RelatedNews } from "./RelatedNews";

// Bagli varlik cip'i — logo (varsa) + ad. Takım/lig/oyuncu tıklanabilir
// (kendi sayfalarına link); ülke şu an link değil (sayfa placeholder).
function EntityChip({
  entity,
  href,
}: {
  entity: NewsEntityRef;
  href?: string;
}) {
  const inner = (
    <>
      {entity.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entity.logo} alt="" className="news-entity-logo" loading="lazy" />
      ) : null}
      <span>{entity.name}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="news-entity-chip">
        {inner}
      </Link>
    );
  }
  return <span className="news-entity-chip is-static">{inner}</span>;
}

export function NewsArticle({
  detail,
  related,
  lang,
}: {
  detail: NewsDetail;
  related: NewsListItem[];
  lang: Lang;
}) {
  const isTr = lang === "tr";
  const t = (tr: string, en: string) => (isTr ? tr : en);
  const date = formatNewsDate(detail.publishedAt, lang);
  const reading = readingLabel(detail.readingMinutes, lang);

  const teams = detail.teams ?? [];
  const leagues = detail.leagues ?? [];
  const players = detail.players ?? [];
  const countries = detail.countries ?? [];
  const hasEntities =
    teams.length + leagues.length + players.length + countries.length > 0;

  return (
    <article className="news-article">
      {/* Breadcrumb (görsel) */}
      <nav className="news-crumbs" aria-label="breadcrumb">
        <Link href="/">{t("Ana Sayfa", "Home")}</Link>
        <span>/</span>
        <Link href={newsListPath(lang)}>{t("Haberler", "News")}</Link>
        <span>/</span>
        <span className="news-crumbs-cur">{detail.title}</span>
      </nav>

      {/* Chips */}
      <div className="news-article-chips">
        {detail.isBreaking ? (
          <span className="news-chip news-chip-breaking">
            {t("Son Dakika", "Breaking")}
          </span>
        ) : null}
        {detail.isFeatured ? (
          <span className="news-chip news-chip-featured">
            {t("Öne Çıkan", "Featured")}
          </span>
        ) : null}
      </div>

      <h1 className="news-article-title">{detail.title}</h1>

      {detail.summary ? (
        <p className="news-article-summary">{detail.summary}</p>
      ) : null}

      {/* Meta satırı: yazar · tarih · okuma · görüntülenme */}
      <div className="news-article-meta">
        {detail.authorName ? <span>{detail.authorName}</span> : null}
        {date ? <span>· {date}</span> : null}
        {reading ? <span>· {reading}</span> : null}
        {detail.viewCount > 0 ? (
          <span>
            · {detail.viewCount} {t("görüntülenme", "views")}
          </span>
        ) : null}
      </div>

      {/* Kapak görseli */}
      {detail.coverImageUrl ? (
        <div className="news-article-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={detail.coverImageUrl} alt={detail.title} />
        </div>
      ) : null}

      {/* Gövde — backend SUNUCUDA SANITIZE ETTI; olduğu gibi render edilir. */}
      {detail.body ? (
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: detail.body }}
        />
      ) : null}

      {/* Kaynak atıf */}
      {detail.source && detail.sourceUrl ? (
        <p className="news-article-source">
          {t("Kaynak", "Source")}:{" "}
          <a href={detail.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
            {detail.source}
          </a>
        </p>
      ) : null}

      {/* İlişkili varlıklar */}
      {hasEntities ? (
        <div className="news-entities">
          <span className="news-entities-label">
            {t("İlgili", "Related")}:
          </span>
          <div className="news-entities-list">
            {teams.map((e) => (
              <EntityChip
                key={`t-${e.id}`}
                entity={e}
                href={teamPath(lang, buildEntitySlug(e.name, e.id))}
              />
            ))}
            {leagues.map((e) => (
              <EntityChip
                key={`l-${e.id}`}
                entity={e}
                href={leaguePath(lang, buildEntitySlug(e.name, e.id))}
              />
            ))}
            {players.map((e) => (
              <EntityChip
                key={`p-${e.id}`}
                entity={e}
                href={playerPath(lang, buildEntitySlug(e.name, e.id))}
              />
            ))}
            {countries.map((e) => (
              <EntityChip key={`c-${e.id}`} entity={e} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Sosyal paylaşım */}
      <NewsShare
        title={detail.title}
        path={newsPath(lang, detail.slug)}
        lang={lang}
      />

      {/* İlgili haberler */}
      <RelatedNews items={related} lang={lang} />
    </article>
  );
}
