import "server-only";
import { backendJson } from "./backend";
import type { PlayerDetailResponse } from "./player-detail-types";
import type { ServerFetchResult } from "./team-detail";

export async function fetchPlayerDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: number | null,
): Promise<ServerFetchResult<PlayerDetailResponse>> {
  const qs = new URLSearchParams({ lang });
  if (season != null) qs.set("season", String(season));
  const r = await backendJson<PlayerDetailResponse>(
    `/api/v1/players/${encodeURIComponent(slug)}?${qs.toString()}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}
