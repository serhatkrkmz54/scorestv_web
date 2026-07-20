import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMatchDetailServer } from "@/lib/match-detail";
import { isMatchIndexable } from "@/lib/match-detail-types";
import { MatchDetailScreen } from "@/components/match/MatchDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { MatchSideInfo } from "@/components/match/MatchSideInfo";
import { RetryablePage } from "@/components/shell/RetryablePage";
import { breadcrumbListJsonLd } from "@/lib/structured-data";
import { escapeJsonLd } from "@/lib/jsonld";
import { fetchHighlightsServer } from "@/lib/highlights-server";
import { videoObjectJsonLd } from "@/lib/video-jsonld";
import { getNewsByFixture } from "@/lib/news-server";
import { RelatedNews } from "@/components/news/RelatedNews";

const FINISHED = new Set(["FT", "AET", "PEN"]);

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await fetchMatchDetailServer(slug, "tr");
  if (!data) return { title: "Maç bulunamadı | Scores TV" };
  const seo = data.seo;
  const title = seo?.title ?? `${data.homeTeam.name} - ${data.awayTeam.name} | Scores TV`;
  const description = seo?.description ?? `${data.homeTeam.name} - ${data.awayTeam.name} maç detayı, canlı skor, dizilişler, istatistikler.`;
  // og:image her zaman dolu olsun — backend görseli yoksa site varsayılanı.
  const image = seo?.openGraph?.image ?? `${SITE}/og-image.png`;
  const canonical = seo?.canonicalUrl ?? undefined;
  const alternates: Record<string, string> = {};
  for (const h of seo?.hreflang ?? []) {
    if (h.lang && h.href) alternates[h.lang] = h.href;
  }
  // İçeriksiz (thin) maç sayfalarını Google'a indexletme — skor/olay/kadro/
  // istatistik/yayın/tahmin yoksa noindex (follow açık: linkler taransın).
  const indexable = isMatchIndexable(data);
  return {
    title,
    description,
    robots: indexable ? undefined : { index: false, follow: true },
    alternates: { canonical, languages: alternates },
    openGraph: {
      title: seo?.openGraph?.title ?? title,
      description: seo?.openGraph?.description ?? description,
      url: canonical,
      images: [{ url: image }],
      locale: "tr_TR",
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
  const { data: initial, status } = await fetchMatchDetailServer(slug, "tr");
  if (!initial) {
    if (status === 404) notFound();
    const pingUrl = `/api/match-detail/${encodeURIComponent(slug)}?lang=tr`;
    return (
      <div className="layout">
        <aside className="rail-left"><LeftRail /></aside>
        <main className="match-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="tr" />
        </main>
      </div>
    );
  }
  // Biten maçta highlight'ları SSR'da bir kez çek — hem VideoObject JSON-LD
  // hem de "Maç Özeti" sekmesinin sunucu-render'lı (Google'ın görebildiği,
  // indekslenebilir) oynatıcısı için. Böylece video "izleme sayfasında" yer alır.
  const highlights = FINISHED.has(initial.status.shortCode)
    ? await fetchHighlightsServer(initial.id)
    : [];
  const videoLd =
    highlights.length > 0 ? videoObjectJsonLd(initial, highlights, "tr") : null;
  // Bu maça bağlı ilgili haberler (SSR, hata → boş; boşsa render edilmez).
  const relatedNews = await getNewsByFixture(initial.id, "tr");
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
          <MatchDetailScreen initial={initial} slug={slug} lang="tr" initialHighlights={highlights} />
          <RelatedNews items={relatedNews} lang="tr" />
        </main>
        <aside className="rail-right">
          <MatchSideInfo detail={initial} lang="tr" />
        </aside>
      </div>
    </>
  );
}
