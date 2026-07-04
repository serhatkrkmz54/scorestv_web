import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchLeagueDetailServer } from "@/lib/league-detail";
import { LeagueDetailScreen } from "@/components/league/LeagueDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { LeagueSideInfo } from "@/components/league/LeagueSideInfo";
import { RetryablePage } from "@/components/shell/RetryablePage";
import { escapeJsonLd } from "@/lib/jsonld";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id: slug } = await params;
  const sp = await searchParams;
  const season = sp.season ? Number(sp.season) : undefined;
  const { data } = await fetchLeagueDetailServer(slug, "tr", season);
  if (!data) return { title: "Lig bulunamadı | ScoresTV" };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} ${data.selectedSeason ?? ""} | ScoresTV`;
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
    keywords: seo?.keywords ?? undefined,
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
        <main className="league-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="tr" />
        </main>
      </div>
    );
  }
  return (
    <>
      {initial.seo?.jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(initial.seo.jsonLd) }}
        />
      ) : null}
      <h1 className="sr-only">{initial.name}</h1>
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <main className="league-detail-main">
          <LeagueDetailScreen initial={initial} slug={slug} lang="tr" />
        </main>
        <aside className="rail-right">
          <LeagueSideInfo detail={initial} lang="tr" />
        </aside>
      </div>
    </>
  );
}
