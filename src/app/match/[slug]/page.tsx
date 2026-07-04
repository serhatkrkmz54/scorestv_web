import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMatchDetailServer } from "@/lib/match-detail";
import { MatchDetailScreen } from "@/components/match/MatchDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { MatchSideInfo } from "@/components/match/MatchSideInfo";
import { RetryablePage } from "@/components/shell/RetryablePage";
import { breadcrumbListJsonLd } from "@/lib/structured-data";
import { escapeJsonLd } from "@/lib/jsonld";
import { fetchHighlightsServer } from "@/lib/highlights-server";
import { videoObjectJsonLd } from "@/lib/video-jsonld";

const FINISHED = new Set(["FT", "AET", "PEN"]);

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await fetchMatchDetailServer(slug, "en");
  if (!data) return { title: "Match not found | ScoresTV" };
  const seo = data.seo;
  const title = seo?.title ?? `${data.homeTeam.name} vs ${data.awayTeam.name} | ScoresTV`;
  const description = seo?.description ?? `${data.homeTeam.name} vs ${data.awayTeam.name} live score, lineups, statistics.`;
  // og:image her zaman dolu olsun — backend görseli yoksa site varsayılanı.
  const image = seo?.openGraph?.image ?? `${SITE}/og-image.png`;
  const canonical = seo?.canonicalUrl ?? undefined;
  const alternates: Record<string, string> = {};
  for (const h of seo?.hreflang ?? []) {
    if (h.lang && h.href) alternates[h.lang] = h.href;
  }
  return {
    title,
    description,
    alternates: { canonical, languages: alternates },
    openGraph: {
      title: seo?.openGraph?.title ?? title,
      description: seo?.openGraph?.description ?? description,
      url: canonical,
      images: [{ url: image }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitter?.title ?? title,
      description: seo?.twitter?.description ?? description,
      images: [image],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const { data: initial, status } = await fetchMatchDetailServer(slug, "en");
  if (!initial) {
    if (status === 404) notFound();
    const pingUrl = `/api/match-detail/${encodeURIComponent(slug)}?lang=en`;
    return (
      <div className="layout">
        <aside className="rail-left"><LeftRail /></aside>
        <main className="match-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="en" />
        </main>
      </div>
    );
  }
  // VideoObject JSON-LD — yalnız biten maçlarda highlight varsa (SSR, cache'li).
  const videoLd = FINISHED.has(initial.status.shortCode)
    ? videoObjectJsonLd(initial, await fetchHighlightsServer(initial.id), "en")
    : null;
  return (
    <>
      {initial.seo?.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(initial.seo.jsonLd) }} />
      ) : null}
      {videoLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(videoLd) }} />
      ) : null}
      {initial.seo?.breadcrumbs && initial.seo.breadcrumbs.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(breadcrumbListJsonLd(initial.seo.breadcrumbs)) }} />
      ) : null}
      <h1 className="sr-only">{initial.homeTeam.name} - {initial.awayTeam.name}</h1>
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <main className="match-detail-main">
          <MatchDetailScreen initial={initial} slug={slug} lang="en" />
        </main>
        <aside className="rail-right">
          <MatchSideInfo detail={initial} lang="en" />
        </aside>
      </div>
    </>
  );
}
