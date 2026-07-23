import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchTeamDetailServer } from "@/lib/team-detail";
import { TeamDetailScreen } from "@/components/team/TeamDetailScreen";
import { LeftRail } from "@/components/home/LeftRail";
import { TeamSideInfo } from "@/components/team/TeamSideInfo";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { RetryablePage } from "@/components/shell/RetryablePage";
import { teamJsonLd } from "@/lib/structured-data";
import { escapeJsonLd } from "@/lib/jsonld";
import { getRelatedByTeam } from "@/lib/news-server";
import { RelatedNews } from "@/components/news/RelatedNews";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const season = sp.season ? Number(sp.season) : undefined;
  const { data } = await fetchTeamDetailServer(slug, "tr", season);
  // Veri yoksa (gecici backend hatasi dahil) noindex — Google'in "bulunamadi"
  // basligini indexlemesini (soft-404) onler.
  if (!data) return { title: "Takım bulunamadı | Scores TV", robots: { index: false, follow: false } };
  const seo = data.seo;
  const title = seo?.title ?? `${data.name} | Scores TV`;
  const description =
    seo?.description ??
    `${data.name} kadrosu, fikstür, puan durumu, transferler ve istatistikler.`;
  const image = seo?.openGraph?.image ?? undefined;
  const alternates: Record<string, string> = {};
  for (const h of seo?.hreflang ?? []) {
    if (h.lang && h.href) alternates[h.lang] = h.href;
  }
  return {
    title,
    description,
    alternates: { canonical: seo?.canonicalUrl ?? undefined, languages: alternates },
    openGraph: {
      title: seo?.openGraph?.title ?? title,
      description: seo?.openGraph?.description ?? description,
      url: seo?.canonicalUrl ?? undefined,
      images: image ? [{ url: image }] : undefined,
      locale: "tr_TR",
      type: "website",
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
  const { data: initial, status } = await fetchTeamDetailServer(slug, "tr", season);
  if (!initial) {
    if (status === 404) notFound();
    // Backend down / 5xx — sayfayi yikma, RetryablePage shell ile bekle ve auto-recover et.
    const pingUrl = `/api/team-detail/${encodeURIComponent(slug)}?lang=tr${season ? `&season=${season}` : ""}`;
    return (
      <div className="layout">
        <aside className="rail-left"><LeftRail /></aside>
        <div className="team-detail-main">
          <RetryablePage pingUrl={pingUrl} lang="tr" />
        </div>
      </div>
    );
  }
  // İlgili haberler (bu takıma bağlı) — SSR, hata olursa boş.
  const relatedNews = await getRelatedByTeam(initial.id, "tr");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(initial.seo?.jsonLd ?? teamJsonLd(initial.name, initial.seo)),
        }}
      />
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <div className="team-detail-main">
          <Breadcrumb items={initial.seo?.breadcrumbs} />
          <TeamDetailScreen initial={initial} slug={slug} lang="tr" />
          <RelatedNews items={relatedNews} lang="tr" />
      </div>
        <aside className="rail-right">
          <TeamSideInfo detail={initial} lang="tr" />
        </aside>
      </div>
    </>
  );
}
