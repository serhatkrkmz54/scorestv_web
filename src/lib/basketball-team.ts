import "server-only";
import { backendJson } from "./backend";
import type { BasketballTeamDetailResponse } from "./basketball-team-types";
import type { ServerFetchResult } from "./team-detail";

// Basketbol takim detayi (SSR) — backend /api/v1/basketball/teams/{slug}.
export async function fetchBasketballTeamDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: string | null,
): Promise<ServerFetchResult<BasketballTeamDetailResponse>> {
  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);
  const r = await backendJson<BasketballTeamDetailResponse>(
    `/api/v1/basketball/teams/${encodeURIComponent(slug)}?${qs.toString()}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}

/**
 * Basketbol takim SEO paketi (JSON-LD + breadcrumb) — AYRI endpoint'ten
 * ({@code /teams/{slug}/seo}). Maç/lig'den farklı olarak takım SEO'su detay
 * yanıtına gömülü DEĞİL; SSR head/JSON-LD + görünür breadcrumb için ayrı çekilir.
 * Hata/eksikse null → sayfa yine render olur (SEO opsiyonel).
 *
 * NOT: Backend bu paketi Map olarak döner; breadcrumb alanı TEKİL isimle
 * (`breadcrumbJsonLd`) gelir (maç/lig `breadcrumbsJsonLd` kullanır).
 */
export interface BasketballTeamSeo {
  jsonLd?: string | null;
  breadcrumbJsonLd?: string | null;
}

export async function fetchBasketballTeamSeoServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: string | null,
): Promise<BasketballTeamSeo | null> {
  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);
  const r = await backendJson<BasketballTeamSeo>(
    `/api/v1/basketball/teams/${encodeURIComponent(slug)}/seo?${qs.toString()}`,
  );
  return r.ok && r.body ? r.body : null;
}
