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

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const { data } = await fetchVolleyballLeagueDetailServer(slug, "tr", sp.season ?? null);
  // Veri yoksa (gecici backend hatasi dahil) noindex — Google'in "bulunamadi"
  // basligini indexlemesini (soft-404) onler.
  if (!data) return { title: "Lig bulunamadı | Scores TV", robots: { index: false, follow: false } };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} ${data.selectedSeason ?? ""} | Scores TV`;
  const description =
    seo?.description ?? `${data.name} puan durumu, fikstür ve maç sonuçları — voleybol.`;
  const canonical = seo?.canonical ?? `${SITE}/voleybol/lig/${data.slug}`;
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
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const { data: initial, status } = await fetchVolleyballLeagueDetailServer(slug, "tr", sp.season ?? null);
  if (!initial) {
    if (status === 404) notFound();
    // Backend down / 5xx / zaman asimi: 200 + "bulunamadi" yerine gercek hata
    // firlat — app/error.tsx HTTP 500 ile auto-retry shell'i gosterir.
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
          <VolleyballLeagueDetailScreen initial={initial} slug={slug} lang="tr" />
        </div>
        <aside className="rail-right">
          <VolleyballLeagueSideInfo detail={initial} lang="tr" />
        </aside>
      </div>
    </>
  );
}
