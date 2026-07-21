import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBasketballLeagueDetailServer } from "@/lib/basketball-league";
import { escapeJsonLd } from "@/lib/jsonld";
import { BasketballLeagueDetailScreen } from "@/components/league/basketball/BasketballLeagueDetailScreen";
import { BasketballLeagueSideInfo } from "@/components/league/basketball/BasketballLeagueSideInfo";
import { BasketballLeftRail } from "@/components/home/BasketballLeftRail";
import { Breadcrumb, crumbsFromJsonLd } from "@/components/seo/Breadcrumb";
import { RetryablePage } from "@/components/shell/RetryablePage";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const { data } = await fetchBasketballLeagueDetailServer(slug, "en", sp.season ?? null);
  if (!data) return { title: "League not found | Scores TV" };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} ${data.selectedSeason ?? ""} | Scores TV`;
  const description =
    seo?.description ?? `${data.name} standings, fixtures and game details.`;
  const canonical = seo?.canonical ?? `${SITE}/basketball/league/${data.slug}`;
  const image = seo?.ogImage ?? undefined;
  const alternates: Record<string, string> = {};
  for (const h of seo?.hreflang ?? []) {
    if (h.lang && h.url) alternates[h.lang] = h.url;
  }
  return {
    title,
    description,
    alternates: { canonical, languages: alternates },
    openGraph: {
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      url: canonical,
      images: image ? [{ url: image }] : undefined,
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const { data: initial, status } = await fetchBasketballLeagueDetailServer(slug, "en", sp.season ?? null);
  if (!initial) {
    if (status === 404) notFound();
    const pingUrl = `/api/basketball/league/${encodeURIComponent(slug)}?lang=en${sp.season ? `&season=${sp.season}` : ""}`;
    return (
      <div className="layout">
        <aside className="rail-left"><BasketballLeftRail /></aside>
        <div className="league-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="en" />
        </div>
      </div>
    );
  }
  return (
    <>
      {initial.seo?.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(initial.seo.jsonLd) }} />
      ) : null}
      {initial.seo?.breadcrumbsJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(initial.seo.breadcrumbsJsonLd) }} />
      ) : null}
      <div className="layout">
        <aside className="rail-left">
          <BasketballLeftRail />
        </aside>
        <div className="league-detail-main">
          <Breadcrumb items={crumbsFromJsonLd(initial.seo?.breadcrumbsJsonLd)} />
          <BasketballLeagueDetailScreen initial={initial} slug={slug} lang="en" />
        </div>
        <aside className="rail-right">
          <BasketballLeagueSideInfo detail={initial} lang="en" />
        </aside>
      </div>
    </>
  );
}
