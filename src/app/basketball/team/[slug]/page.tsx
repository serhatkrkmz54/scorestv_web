import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBasketballTeamDetailServer, fetchBasketballTeamSeoServer } from "@/lib/basketball-team";
import { BasketballTeamDetailScreen } from "@/components/team/basketball/BasketballTeamDetailScreen";
import { BasketballTeamSideInfo } from "@/components/team/basketball/BasketballTeamSideInfo";
import { BasketballLeftRail } from "@/components/home/BasketballLeftRail";
import { Breadcrumb, crumbsFromJsonLd } from "@/components/seo/Breadcrumb";
import { escapeJsonLd } from "@/lib/jsonld";
import { RetryablePage } from "@/components/shell/RetryablePage";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const { data } = await fetchBasketballTeamDetailServer(slug, "en", sp.season ?? null);
  if (!data) return { title: "Team not found | Scores TV" };
  const name = data.hero.displayName ?? data.hero.name;
  const title = `${name} Basketball | Scores TV`;
  const description = `${name} roster, fixtures, statistics and standings — basketball.`;
  const canonical = `${SITE}/basketball/team/${data.hero.slug ?? slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: data.hero.logo ? [{ url: data.hero.logo }] : undefined,
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const { data: initial, status } = await fetchBasketballTeamDetailServer(slug, "en", sp.season ?? null);
  if (!initial) {
    if (status === 404) notFound();
    const pingUrl = `/api/basketball/team/${encodeURIComponent(slug)}?lang=en${sp.season ? `&season=${sp.season}` : ""}`;
    return (
      <div className="layout">
        <aside className="rail-left"><BasketballLeftRail /></aside>
        <div className="team-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="en" />
        </div>
      </div>
    );
  }
  const seo = await fetchBasketballTeamSeoServer(slug, "en", sp.season ?? null);
  return (
    <>
      {seo?.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(seo.jsonLd) }} />
      ) : null}
      {seo?.breadcrumbJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(seo.breadcrumbJsonLd) }} />
      ) : null}
      <div className="layout">
        <aside className="rail-left">
          <BasketballLeftRail />
        </aside>
        <div className="team-detail-main">
          <Breadcrumb items={crumbsFromJsonLd(seo?.breadcrumbJsonLd)} />
          <BasketballTeamDetailScreen initial={initial} slug={slug} lang="en" />
        </div>
        <aside className="rail-right">
          <BasketballTeamSideInfo detail={initial} lang="en" />
        </aside>
      </div>
    </>
  );
}
