import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { backendUnavailable } from "@/lib/backend-unavailable";
import { fetchPlayerDetailServer } from "@/lib/player-detail";
import { PlayerDetailScreen } from "@/components/player/PlayerDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { PlayerSideInfo } from "@/components/player/PlayerSideInfo";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { playerJsonLd } from "@/lib/structured-data";
import { escapeJsonLd } from "@/lib/jsonld";
import { getRelatedByTeam } from "@/lib/news-server";
import { RelatedNews } from "@/components/news/RelatedNews";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const season = sp.season ? Number(sp.season) : undefined;
  const { data } = await fetchPlayerDetailServer(slug, "en", season);
  // Veri yoksa (gecici backend hatasi dahil) noindex — Google'in "bulunamadi"
  // basligini indexlemesini (soft-404) onler.
  if (!data) return { title: "Player not found | Scores TV", robots: { index: false, follow: false } };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} | Scores TV`;
  const description =
    seo?.description ??
    `${data.name} profile, career teams, season stats, transfers and trophies.`;
  const image = seo?.openGraph?.image ?? undefined;
  const alternates: Record<string, string> = {};
  for (const h of seo?.hreflang ?? []) {
    if (h.lang && h.href) alternates[h.lang] = h.href;
  }
  return {
    title,
    description,
    alternates: { canonical: seo?.canonicalUrl ?? undefined, languages: alternates },
    openGraph: {
      title: seo?.openGraph?.title ?? title,
      description: seo?.openGraph?.description ?? description,
      url: seo?.canonicalUrl ?? undefined,
      images: image ? [{ url: image }] : undefined,
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitter?.title ?? title,
      description: seo?.twitter?.description ?? description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const season = sp.season ? Number(sp.season) : undefined;
  const { data: initial, status } = await fetchPlayerDetailServer(slug, "en", season);
  if (!initial) {
    if (status === 404) notFound();
    // Backend down / 5xx / zaman asimi: 200 + "bulunamadi" yerine gercek hata
    // firlat — app/error.tsx HTTP 500 ile auto-retry shell'i gosterir (SEO:
    // Google 5xx'i gecici sayar; index korunur, hatali baslik indexlenmez).
    backendUnavailable();
  }
  const relatedNews = initial.currentTeam?.id
    ? await getRelatedByTeam(initial.currentTeam.id, "en")
    : [];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(initial.seo?.jsonLd ?? playerJsonLd(initial.name, initial.seo)),
        }}
      />
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <div className="player-detail-main">
          <Breadcrumb items={initial.seo?.breadcrumbs} />
          <PlayerDetailScreen initial={initial} slug={slug} lang="en" />
          <RelatedNews items={relatedNews} lang="en" />
        </div>
        <aside className="rail-right">
          <PlayerSideInfo detail={initial} lang="en" />
        </aside>
      </div>
    </>
  );
}
