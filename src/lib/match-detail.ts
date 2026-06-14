import "server-only";
import { backendJson } from "./backend";
import type { MatchDetailResponse } from "./match-detail-types";
import type { ServerFetchResult } from "./team-detail";

export async function fetchMatchDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
): Promise<ServerFetchResult<MatchDetailResponse>> {
  const r = await backendJson<MatchDetailResponse>(
    `/api/v1/fixtures/${encodeURIComponent(slug)}?lang=${lang}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}
