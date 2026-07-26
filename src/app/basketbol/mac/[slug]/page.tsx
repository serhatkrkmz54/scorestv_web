import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { backendUnavailable } from "@/lib/backend-unavailable";
import { fetchBasketballDetailServer } from "@/lib/basketball-detail";
import { escapeJsonLd } from "@/lib/jsonld";
import { BasketballDetailScreen } from "@/components/match/basketball/BasketballDetailScreen";
import { BasketballLeftRail } from "@/components/home/BasketballLeftRail";
import { Breadcrumb, crumbsFromJsonLd } from "@/components/seo/Breadcrumb";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await fetchBasketballDetailServer(slug, "tr");
  // Veri yoksa (gecici backend hatasi dahil) noindex — Google'in "bulunamadi"
  // basligini indexlemesini (soft-404) onler.
  if (!data) return { title: "Maç bulunamadı | Scores TV", robots: { index: false, follow: false } };
  const seo = data.seo;
  const home = data.homeTeam.displayName ?? data.homeTeam.name;
  const away = data.awayTeam.displayName ?? data.awayTeam.name;
  const title = seo?.title ?? `${home} - ${away} | Scores TV`;
  const description =
    seo?.description ?? `${home} - ${away} basketbol maçı; canlı skor, çeyrek skorları, puan durumu.`;
  const image = seo?.ogImage ?? `${SITE}/og-image.png`;
  return {
    title,
    description,
    alternates: { canonical: seo?.canonical ?? undefined },
    openGraph: {
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      url: seo?.canonical ?? undefined,
      images: [{ url: image }],
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const { data: initial, status } = await fetchBasketballDetailServer(slug, "tr");
  if (!initial) {
    if (status === 404) notFound();
    // Backend down / 5xx / zaman asimi: 200 + "bulunamadi" yerine gercek hata
    // firlat — app/error.tsx HTTP 500 ile auto-retry shell'i gosterir (SEO:
    // Google 5xx'i gecici sayar; index korunur, hatali baslik indexlenmez).
    backendUnavailable();
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
          <BasketballLeftRail />
        </aside>
        <div className="match-detail-main">
          <Breadcrumb items={crumbsFromJsonLd(initial.seo?.breadcrumbsJsonLd)} />
          <BasketballDetailScreen initial={initial} slug={slug} lang="tr" />
        </div>
      </div>
    </>
  );
}
