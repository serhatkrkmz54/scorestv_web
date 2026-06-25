import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBasketballLeagueDetailServer } from "@/lib/basketball-league";
import { BasketballLeagueDetailScreen } from "@/components/league/basketball/BasketballLeagueDetailScreen";
import { BasketballLeagueSideInfo } from "@/components/league/basketball/BasketballLeagueSideInfo";
import { BasketballLeftRail } from "@/components/home/BasketballLeftRail";
import { RetryablePage } from "@/components/shell/RetryablePage";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const { data } = await fetchBasketballLeagueDetailServer(slug, "tr", sp.season ?? null);
  if (!data) return { title: "Lig bulunamadı | ScoresTV" };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} ${data.selectedSeason ?? ""} | ScoresTV`;
  const description =
    seo?.description ?? `${data.name} puan durumu, fikstür ve maç detayları.`;
  const canonical = seo?.canonical ?? `${SITE}/basketbol/lig/${data.slug}`;
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
  const { data: initial, status } = await fetchBasketballLeagueDetailServer(slug, "tr", sp.season ?? null);
  if (!initial) {
    if (status === 404) notFound();
    const pingUrl = `/api/basketball/league/${encodeURIComponent(slug)}?lang=tr${sp.season ? `&season=${sp.season}` : ""}`;
    return (
      <div className="layout">
        <aside className="rail-left"><BasketballLeftRail /></aside>
        <main className="league-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="tr" />
        </main>
      </div>
    );
  }
  return (
    <>
      {initial.seo?.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: initial.seo.jsonLd }} />
      ) : null}
      <h1 className="sr-only">{initial.name}</h1>
      <div className="layout">
        <aside className="rail-left">
          <BasketballLeftRail />
        </aside>
        <main className="league-detail-main">
          <BasketballLeagueDetailScreen initial={initial} slug={slug} lang="tr" />
        </main>
        <aside className="rail-right">
          <BasketballLeagueSideInfo detail={initial} lang="tr" />
        </aside>
      </div>
    </>
  );
}
