import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { backendUnavailable } from "@/lib/backend-unavailable";
import { fetchVolleyballLeagueDetailServer } from "@/lib/volleyball-league";
import { escapeJsonLd } from "@/lib/jsonld";
import { VolleyballLeagueDetailScreen } from "@/components/league/volleyball/VolleyballLeagueDetailScreen";
import { VolleyballLeagueSideInfo } from "@/components/league/volleyball/VolleyballLeagueSideInfo";
import { VolleyballLeftRail } from "@/components/home/VolleyballLeftRail";
import { Breadcrumb, crumbsFromJsonLd } from "@/components/seo/Breadcrumb";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

// /voleybol/lig ile ayni icerik — Ingilizce URL alternatifi.
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const { data } = await fetchVolleyballLeagueDetailServer(slug, "en", sp.season ?? null);
  // Veri yoksa (gecici backend hatasi dahil) noindex — soft-404 onlemi.
  if (!data) return { title: "League not found | Scores TV", robots: { index: false, follow: false } };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} ${data.selectedSeason ?? ""} | Scores TV`;
  const description =
    seo?.description ?? `${data.name} standings, fixtures and match results — volleyball.`;
  const canonical = seo?.canonical ?? `${SITE}/volleyball/league/${data.slug}`;
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
  const { data: initial, status } = await fetchVolleyballLeagueDetailServer(slug, "en", sp.season ?? null);
  if (!initial) {
    if (status === 404) notFound();
    // Backend down / 5xx / zaman asimi: gercek hata firlat (error.tsx, HTTP 500).
    backendUnavailable();
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
          <VolleyballLeftRail />
        </aside>
        <div className="league-detail-main">
          <Breadcrumb items={crumbsFromJsonLd(initial.seo?.breadcrumbsJsonLd)} />
          <VolleyballLeagueDetailScreen initial={initial} slug={slug} lang="en" />
        </div>
        <aside className="rail-right">
          <VolleyballLeagueSideInfo detail={initial} lang="en" />
        </aside>
      </div>
    </>
  );
}
