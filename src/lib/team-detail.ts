import "server-only";
import { backendJson } from "./backend";
import type { TeamDetailResponse } from "./team-detail-types";

export interface ServerFetchResult<T> {
  data: T | null;
  /**
   * HTTP status — page.tsx tarafinda 404 vs 503 ayriminda kullanilir:
   *   404 → notFound()
   *   diger (503/500/network) → RetryablePage shell
   */
  status: number;
}

export async function fetchTeamDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
  season?: number | null,
): Promise<ServerFetchResult<TeamDetailResponse>> {
  const qs = new URLSearchParams({ lang });
  if (season != null) qs.set("season", String(season));
  const r = await backendJson<TeamDetailResponse>(
    `/api/v1/teams/${encodeURIComponent(slug)}?${qs.toString()}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}
