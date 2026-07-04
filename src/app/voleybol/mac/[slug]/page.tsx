import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchVolleyballDetailServer } from "@/lib/volleyball-detail";
import { escapeJsonLd } from "@/lib/jsonld";
import { VolleyballDetailScreen } from "@/components/match/volleyball/VolleyballDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await fetchVolleyballDetailServer(slug, "tr");
  if (!data) return { title: "Maç bulunamadı | ScoresTV" };
  const home = data.homeTeam.displayName ?? data.homeTeam.name;
  const away = data.awayTeam.displayName ?? data.awayTeam.name;
  const seo = data.seo;
  const title = seo?.title ?? `${home} - ${away} | ScoresTV`;
  const description =
    seo?.description ??
    `${home} - ${away} voleybol maçı; canlı skor, set skorları, puan durumu.`;
  const image = seo?.ogImage ?? `${SITE}/og-image.png`;
  const canonical = seo?.canonical ?? undefined;
  const languages: Record<string, string> = {};
  for (const h of seo?.hreflang ?? []) {
    if (h.lang && h.url) languages[h.lang] = h.url;
  }
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: Object.keys(languages).length ? languages : undefined,
    },
    openGraph: {
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      url: canonical,
      images: [{ url: image }],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      images: [image],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const { data: initial, status } = await fetchVolleyballDetailServer(slug, "tr");
  if (!initial) {
    if (status === 404) notFound();
    notFound();
  }
  const home = initial.homeTeam.displayName ?? initial.homeTeam.name;
  const away = initial.awayTeam.displayName ?? initial.awayTeam.name;
  return (
    <>
      {initial.seo?.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(initial.seo.jsonLd) }} />
      ) : null}
      {initial.seo?.breadcrumbsJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(initial.seo.breadcrumbsJsonLd) }} />
      ) : null}
      <h1 className="sr-only">{home} - {away}</h1>
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <main className="match-detail-main">
          <VolleyballDetailScreen initial={initial} slug={slug} lang="tr" />
        </main>
      </div>
    </>
  );
}
