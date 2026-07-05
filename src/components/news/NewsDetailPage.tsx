import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getNewsBySlug,
  getRelatedBySlug,
  getRelatedByTeam,
  getRelatedByLeague,
} from "@/lib/news-server";
import { newsPath, newsListPath } from "@/lib/news-format";
import { escapeJsonLd } from "@/lib/jsonld";
import { newsArticleJsonLd } from "@/lib/structured-data";
import { LeftRail } from "@/components/home/LeftRail";
import { NewsArticle } from "./NewsArticle";
import type { Lang } from "@/i18n/auth-strings";
import type { NewsDetail, NewsListItem } from "@/lib/news-types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

// Haber detay metadata'si — TR/EN rotalari bunu cagirir (lang sabit gelir).
export async function buildNewsMetadata(
  slug: string,
  lang: Lang,
): Promise<Metadata> {
  const { data } = await getNewsBySlug(slug);
  const isTr = lang === "tr";
  if (!data) {
    return { title: isTr ? "Haber bulunamadı | ScoresTV" : "News not found | ScoresTV" };
  }
  const title = `${data.title} | ScoresTV`;
  const description = data.summary ?? data.title;
  const canonical = `${SITE}${newsPath(lang, data.slug)}`;
  const image = data.coverImageUrl ?? `${SITE}/og-image.png`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: data.title,
      description,
      url: canonical,
      images: [{ url: image }],
      locale: isTr ? "tr_TR" : "en_US",
      type: "article",
      publishedTime: data.publishedAt ?? undefined,
      authors: data.authorName ? [data.authorName] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description,
      images: [image],
    },
  };
}

// İlgili haberler: once ES-tabanli /related (slug) — en alakalisi. Bos donerse
// eski davranisa duser: ilk bagli takim → yoksa ilk bagli lig. Kendisini haric
// tutar. Hata olursa bos.
async function fetchRelated(
  detail: NewsDetail,
  lang: Lang,
): Promise<NewsListItem[]> {
  // Once slug-tabanli ilgili haberler (ES ranked, backend DB fallback saglar).
  let items = await getRelatedBySlug(detail.slug, 6);
  // Bos ise (ES kapali + fallback de bos) takim/lig uzerinden nazik yedek.
  if (items.length === 0) {
    const teamId = detail.teams?.[0]?.id;
    const leagueId = detail.leagues?.[0]?.id;
    if (teamId != null) {
      items = await getRelatedByTeam(teamId, lang, 6);
    }
    if (items.length === 0 && leagueId != null) {
      items = await getRelatedByLeague(leagueId, lang, 6);
    }
  }
  return items.filter((n) => n.id !== detail.id).slice(0, 5);
}

// Haber detay sayfasi govdesi — TR/EN rotalari bunu render eder.
export async function NewsDetailPage({
  slug,
  lang,
}: {
  slug: string;
  lang: Lang;
}) {
  const { data, status } = await getNewsBySlug(slug);
  if (!data) {
    if (status === 404) notFound();
    // Diger hatalarda da 404 — haber ya vardir ya yoktur (retry gerektirmez).
    notFound();
  }

  const related = await fetchRelated(data, lang);

  const canonical = `${SITE}${newsPath(lang, data.slug)}`;
  const crumbs = [
    { position: 1, name: "Scores TV", url: SITE },
    {
      position: 2,
      name: lang === "tr" ? "Haberler" : "News",
      url: `${SITE}${newsListPath(lang)}`,
    },
    { position: 3, name: data.title, url: canonical },
  ];
  const jsonLd = newsArticleJsonLd(
    {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      coverImageUrl: data.coverImageUrl,
      authorName: data.authorName,
      publishedAt: data.publishedAt,
    },
    canonical,
    crumbs,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(jsonLd) }}
      />
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <main className="news-detail-main">
          <NewsArticle detail={data} related={related} lang={lang} />
        </main>
        <aside className="rail-right" />
      </div>
    </>
  );
}
