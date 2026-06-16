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
    { "@type": "ListItem", position: 1, name: "ScoresTV", item: SITE },
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
