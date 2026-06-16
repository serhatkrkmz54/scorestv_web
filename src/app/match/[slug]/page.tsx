import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMatchDetailServer } from "@/lib/match-detail";
import { MatchDetailScreen } from "@/components/match/MatchDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { MatchSideInfo } from "@/components/match/MatchSideInfo";
import { RetryablePage } from "@/components/shell/RetryablePage";

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
  const image = seo?.image ?? undefined;
  const og = seo?.openGraph ?? {};
  const alternates: Record<string, string> = {};
  for (const h of seo?.hreflang ?? []) alternates[h.hreflang] = h.href;
  return {
    title,
    description,
    alternates: { canonical: seo?.canonical, languages: alternates },
    openGraph: {
      title: (og["og:title"] as string) ?? title,
      description: (og["og:description"] as string) ?? description,
      url: seo?.canonical,
      images: image ? [{ url: image }] : undefined,
      locale: "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
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
  return (
    <>
      {initial.seo?.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: initial.seo.jsonLd }} />
      ) : null}
      {initial.seo?.breadcrumbJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: initial.seo.breadcrumbJsonLd }} />
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
