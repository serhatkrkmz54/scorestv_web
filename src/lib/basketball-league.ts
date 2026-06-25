import "server-only";
import { backendJson } from "./backend";
import type {
  BasketballLeagueDetailResponse,
  BasketballLeagueHubResponse,
} from "./basketball-league-types";
import type { ServerFetchResult } from "./team-detail";

// Basketbol lig detayi (SSR) — backend /api/v1/basketball/leagues/{slug}/detail.
export async function fetchBasketballLeagueDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: string | null,
): Promise<ServerFetchResult<BasketballLeagueDetailResponse>> {
  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);
  const r = await backendJson<BasketballLeagueDetailResponse>(
    `/api/v1/basketball/leagues/${encodeURIComponent(slug)}/detail?${qs.toString()}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}

// Basketbol lig hub (SSR/BFF) — backend /api/v1/basketball/leagues/hub.
export async function fetchBasketballHubServer(
  lang: "tr" | "en" = "tr",
): Promise<ServerFetchResult<BasketballLeagueHubResponse>> {
  const r = await backendJson<BasketballLeagueHubResponse>(
    `/api/v1/basketball/leagues/hub?lang=${lang}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}
