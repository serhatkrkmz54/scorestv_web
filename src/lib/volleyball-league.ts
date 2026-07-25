import "server-only";
import { backendJson } from "./backend";
import type { VolleyballLeagueDetailResponse } from "./volleyball-league-types";
import type { ServerFetchResult } from "./team-detail";

// Voleybol lig detayi (SSR) — backend /api/v1/volleyball/leagues/{slug}/detail.
export async function fetchVolleyballLeagueDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: string | null,
): Promise<ServerFetchResult<VolleyballLeagueDetailResponse>> {
  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);
  const r = await backendJson<VolleyballLeagueDetailResponse>(
    `/api/v1/volleyball/leagues/${encodeURIComponent(slug)}/detail?${qs.toString()}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}
