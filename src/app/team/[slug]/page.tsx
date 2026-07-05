import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchTeamDetailServer } from "@/lib/team-detail";
import { TeamDetailScreen } from "@/components/team/TeamDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { TeamSideInfo } from "@/components/team/TeamSideInfo";
import { RetryablePage } from "@/components/shell/RetryablePage";
import { teamJsonLd } from "@/lib/structured-data";
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
  const { data } = await fetchTeamDetailServer(slug, "en", season);
  if (!data) return { title: "Team not found | ScoresTV" };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} | ScoresTV`;
  const description =
    seo?.description ??
    `${data.name} squad, fixtures, standings, transfers and statistics.`;
  const image = seo?.openGraph?.image ?? undefined;
  const alternates: Record<string, string> = {};
  for (const h of seo?.hreflang ?? []) {
    if (h.lang && h.href) alternates[h.lang] = h.href;
  }
  return {
    title,
    description,
    keywords: seo?.keywords ?? undefined,
    alternates: { canonical: seo?.canonicalUrl ?? undefined, languages: alternates },
    openGraph: {
      title: seo?.openGraph?.title ?? title,
      description: seo?.openGraph?.description ?? description,
      url: seo?.canonicalUrl ?? undefined,
      images: image ? [{ url: image }] : undefined,
      locale: "en_US",
      type: "website",
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
  const { data: initial, status } = await fetchTeamDetailServer(slug, "en", season);
  if (!initial) {
    if (status === 404) notFound();
    const pingUrl = `/api/team-detail/${encodeURIComponent(slug)}?lang=en${season ? `&season=${season}` : ""}`;
    return (
      <div className="layout">
        <aside className="rail-left"><LeftRail /></aside>
        <main className="team-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="en" />
        </main>
      </div>
    );
  }
  const relatedNews = await getRelatedByTeam(initial.id, "en");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(initial.seo?.jsonLd ?? teamJsonLd(initial.name, initial.seo)),
        }}
      />
      <h1 className="sr-only">{initial.name}</h1>
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <main className="team-detail-main">
          <TeamDetailScreen initial={initial} slug={slug} lang="en" />
          <RelatedNews items={relatedNews} lang="en" />
        </main>
        <aside className="rail-right">
          <TeamSideInfo detail={initial} lang="en" />
        </aside>
      </div>
    </>
  );
}
