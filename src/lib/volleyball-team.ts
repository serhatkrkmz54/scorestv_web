import "server-only";
import { backendJson } from "./backend";
import type {
  VolleyballTeamDetailResponse,
  VolleyballTeamSeo,
} from "./volleyball-team-types";
import type { ServerFetchResult } from "./team-detail";

// Voleybol takim detayi (SSR) — backend /api/v1/volleyball/teams/{slug}.
export async function fetchVolleyballTeamDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: string | null,
): Promise<ServerFetchResult<VolleyballTeamDetailResponse>> {
  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);
  const r = await backendJson<VolleyballTeamDetailResponse>(
    `/api/v1/volleyball/teams/${encodeURIComponent(slug)}?${qs.toString()}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}

// Takim SEO paketi (JSON-LD + breadcrumb + hreflang) — hata olursa null.
export async function fetchVolleyballTeamSeoServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: string | null,
): Promise<VolleyballTeamSeo | null> {
  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);
  const r = await backendJson<VolleyballTeamSeo>(
    `/api/v1/volleyball/teams/${encodeURIComponent(slug)}/seo?${qs.toString()}`,
  );
  return r.ok && r.body ? r.body : null;
}
