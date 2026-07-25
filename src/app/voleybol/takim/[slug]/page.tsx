import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { backendUnavailable } from "@/lib/backend-unavailable";
import { fetchVolleyballTeamDetailServer, fetchVolleyballTeamSeoServer } from "@/lib/volleyball-team";
import { VolleyballTeamDetailScreen } from "@/components/team/volleyball/VolleyballTeamDetailScreen";
import { VolleyballTeamSideInfo } from "@/components/team/volleyball/VolleyballTeamSideInfo";
import { VolleyballLeftRail } from "@/components/home/VolleyballLeftRail";
import { Breadcrumb, crumbsFromJsonLd } from "@/components/seo/Breadcrumb";
import { escapeJsonLd } from "@/lib/jsonld";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const { data } = await fetchVolleyballTeamDetailServer(slug, "tr", sp.season ?? null);
  // Veri yoksa (gecici backend hatasi dahil) noindex — soft-404 onlemi.
  if (!data) return { title: "Takım bulunamadı | Scores TV", robots: { index: false, follow: false } };
  const name = data.displayName ?? data.name;
  const title = `${name} Voleybol | Scores TV`;
  const description = `${name} fikstür, maç sonuçları, sezon istatistikleri ve puan durumu — voleybol.`;
  const canonical = `${SITE}/voleybol/takim/${data.slug || slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: data.logo ? [{ url: data.logo }] : undefined,
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const { data: initial, status } = await fetchVolleyballTeamDetailServer(slug, "tr", sp.season ?? null);
  if (!initial) {
    if (status === 404) notFound();
    // Backend down / 5xx / zaman asimi: gercek hata firlat (error.tsx, HTTP 500).
    backendUnavailable();
  }
  const seo = await fetchVolleyballTeamSeoServer(slug, "tr", sp.season ?? null);
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
          <VolleyballLeftRail />
        </aside>
        <div className="team-detail-main">
          <Breadcrumb items={crumbsFromJsonLd(seo?.breadcrumbJsonLd)} />
          <VolleyballTeamDetailScreen initial={initial} lang="tr" />
        </div>
        <aside className="rail-right">
          <VolleyballTeamSideInfo detail={initial} lang="tr" />
        </aside>
      </div>
    </>
  );
}
