import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBasketballDetailServer } from "@/lib/basketball-detail";
import { BasketballDetailScreen } from "@/components/match/basketball/BasketballDetailScreen";
import { BasketballLeftRail } from "@/components/home/BasketballLeftRail";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await fetchBasketballDetailServer(slug, "en");
  if (!data) return { title: "Match not found | ScoresTV" };
  const seo = data.seo;
  const home = data.homeTeam.displayName ?? data.homeTeam.name;
  const away = data.awayTeam.displayName ?? data.awayTeam.name;
  const title = seo?.title ?? `${home} vs ${away} | ScoresTV`;
  const description =
    seo?.description ?? `${home} vs ${away} basketball game; live score, quarter scores, standings.`;
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
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const { data: initial, status } = await fetchBasketballDetailServer(slug, "en");
  if (!initial) {
    if (status === 404) notFound();
    notFound();
  }
  const home = initial.homeTeam.displayName ?? initial.homeTeam.name;
  const away = initial.awayTeam.displayName ?? initial.awayTeam.name;
  return (
    <>
      {initial.seo?.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: initial.seo.jsonLd }} />
      ) : null}
      <h1 className="sr-only">{home} - {away}</h1>
      <div className="layout">
        <aside className="rail-left">
          <BasketballLeftRail />
        </aside>
        <main className="match-detail-main">
          <BasketballDetailScreen initial={initial} slug={slug} lang="en" />
        </main>
      </div>
    </>
  );
}
