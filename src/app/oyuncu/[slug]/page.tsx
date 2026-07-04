import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPlayerDetailServer } from "@/lib/player-detail";
import { PlayerDetailScreen } from "@/components/player/PlayerDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { PlayerSideInfo } from "@/components/player/PlayerSideInfo";
import { RetryablePage } from "@/components/shell/RetryablePage";
import { playerJsonLd } from "@/lib/structured-data";
import { escapeJsonLd } from "@/lib/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const season = sp.season ? Number(sp.season) : undefined;
  const { data } = await fetchPlayerDetailServer(slug, "tr", season);
  if (!data) return { title: "Oyuncu bulunamadı | ScoresTV" };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} | ScoresTV`;
  const description =
    seo?.description ??
    `${data.name} profili, kariyer takımları, sezon istatistikleri, transferler ve kupalar.`;
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
      type: "profile",
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
  const { data: initial, status } = await fetchPlayerDetailServer(slug, "tr", season);
  if (!initial) {
    if (status === 404) notFound();
    const pingUrl = `/api/player-detail/${encodeURIComponent(slug)}?lang=tr${season ? `&season=${season}` : ""}`;
    return (
      <div className="layout">
        <aside className="rail-left"><LeftRail /></aside>
        <main className="player-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="tr" />
        </main>
      </div>
    );
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(initial.seo?.jsonLd ?? playerJsonLd(initial.name, initial.seo)),
        }}
      />
      <h1 className="sr-only">{initial.name}</h1>
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <main className="player-detail-main">
          <PlayerDetailScreen initial={initial} slug={slug} lang="tr" />
        </main>
        <aside className="rail-right">
          <PlayerSideInfo detail={initial} lang="tr" />
        </aside>
      </div>
    </>
  );
}
