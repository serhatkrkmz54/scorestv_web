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
