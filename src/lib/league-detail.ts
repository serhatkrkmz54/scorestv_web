import "server-only";
import { backendJson } from "./backend";
import type { LeagueDetailResponse } from "./league-detail-types";
import type { ServerFetchResult } from "./team-detail";

export async function fetchLeagueDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: number | null,
): Promise<ServerFetchResult<LeagueDetailResponse>> {
  const qs = new URLSearchParams({ lang });
  if (season != null) qs.set("season", String(season));
  const r = await backendJson<LeagueDetailResponse>(
    `/api/v1/leagues/${encodeURIComponent(slug)}?${qs.toString()}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}
