import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchLeagueDetailServer } from "@/lib/league-detail";
import { LeagueDetailScreen } from "@/components/league/LeagueDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { LeagueSideInfo } from "@/components/league/LeagueSideInfo";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { RetryablePage } from "@/components/shell/RetryablePage";
import { escapeJsonLd } from "@/lib/jsonld";
import { getRelatedByLeague } from "@/lib/news-server";
import { RelatedNews } from "@/components/news/RelatedNews";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id: slug } = await params;
  const sp = await searchParams;
  const season = sp.season ? Number(sp.season) : undefined;
  const { data } = await fetchLeagueDetailServer(slug, "tr", season);
  // Veri yoksa (gecici backend hatasi dahil) noindex — Google'in "bulunamadi"
  // basligini indexlemesini (soft-404) onler.
  if (!data) return { title: "Lig bulunamadı | Scores TV", robots: { index: false, follow: false } };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} ${data.selectedSeason ?? ""} | Scores TV`;
  const description =
    seo?.description ??
    `${data.name} puan durumu, fikstür, gol kralları ve detaylar.`;
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
      locale: "tr_TR",
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
  const { id: slug } = await params;
  const sp = await searchParams;
  const season = sp.season ? Number(sp.season) : undefined;
  const { data: initial, status } = await fetchLeagueDetailServer(slug, "tr", season);
  if (!initial) {
    if (status === 404) notFound();
    const pingUrl = `/api/league-detail/${encodeURIComponent(slug)}?lang=tr${season ? `&season=${season}` : ""}`;
    return (
      <div className="layout">
        <aside className="rail-left"><LeftRail /></aside>
        <div className="league-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="tr" />
        </div>
      </div>
    );
  }
  const relatedNews = await getRelatedByLeague(initial.id, "tr");
  return (
    <>
      {initial.seo?.jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(initial.seo.jsonLd) }}
        />
      ) : null}
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <div className="league-detail-main">
          <Breadcrumb items={initial.seo?.breadcrumbs} />
          <LeagueDetailScreen initial={initial} slug={slug} lang="tr" />
          <RelatedNews items={relatedNews} lang="tr" />
        </div>
        <aside className="rail-right">
          <LeagueSideInfo detail={initial} lang="tr" />
        </aside>
      </div>
    </>
  );
}
