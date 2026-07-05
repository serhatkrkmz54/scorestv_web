// JSON-LD (schema.org) ureticileri — backend seo.jsonLd vermediginde frontend
// fallback olarak kullanir (takim/oyuncu). Lig/mac jsonLd'yi backend saglar.
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface SeoLike {
  canonicalUrl?: string | null;
  openGraph?: { image?: string | null } | null;
}

/** Backend seo.breadcrumbs listesinden Schema.org BreadcrumbList JSON-LD üretir. */
export interface BreadcrumbStep {
  position: number;
  name: string;
  url: string;
}
export function breadcrumbListJsonLd(items: BreadcrumbStep[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((b) => ({
      "@type": "ListItem",
      position: b.position,
      name: b.name,
      item: b.url,
    })),
  });
}

function breadcrumb(name: string, url: string | undefined): Record<string, unknown> {
  const items: Record<string, unknown>[] = [
    { "@type": "ListItem", position: 1, name: "Scores TV", item: SITE },
  ];
  if (url) items.push({ "@type": "ListItem", position: 2, name, item: url });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/** Takim → SportsTeam + BreadcrumbList. */
export function teamJsonLd(name: string, seo: SeoLike | null | undefined): string {
  const url = seo?.canonicalUrl ?? undefined;
  const logo = seo?.openGraph?.image ?? undefined;
  const team: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name,
    sport: "Soccer",
  };
  if (url) team.url = url;
  if (logo) team.logo = logo;
  return JSON.stringify([team, breadcrumb(name, url)]);
}

/** Haber → NewsArticle + BreadcrumbList. body sanitize edilmis HTML; JSON-LD'de
 *  yalniz meta (baslik/gorsel/tarih/yazar/yayinci) kullanilir. escapeJsonLd ile
 *  gomulur (mac/takim ile ayni disiplin). */
export function newsArticleJsonLd(
  a: {
    title: string;
    slug: string;
    summary?: string | null;
    coverImageUrl?: string | null;
    authorName?: string | null;
    publishedAt?: string | null;
  },
  canonicalUrl: string,
  crumbs: BreadcrumbStep[],
): string {
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: "Scores TV",
      logo: { "@type": "ImageObject", url: `${SITE}/icon.png` },
    },
  };
  if (a.summary) article.description = a.summary;
  if (a.coverImageUrl) article.image = [a.coverImageUrl];
  if (a.publishedAt) {
    article.datePublished = a.publishedAt;
    article.dateModified = a.publishedAt;
  }
  if (a.authorName) {
    article.author = { "@type": "Person", name: a.authorName };
  } else {
    article.author = { "@type": "Organization", name: "Scores TV" };
  }
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((b) => ({
      "@type": "ListItem",
      position: b.position,
      name: b.name,
      item: b.url,
    })),
  };
  return JSON.stringify([article, breadcrumb]);
}

/** Oyuncu → Person + BreadcrumbList. */
export function playerJsonLd(name: string, seo: SeoLike | null | undefined): string {
  const url = seo?.canonicalUrl ?? undefined;
  const image = seo?.openGraph?.image ?? undefined;
  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
  };
  if (url) person.url = url;
  if (image) person.image = image;
  return JSON.stringify([person, breadcrumb(name, url)]);
}
