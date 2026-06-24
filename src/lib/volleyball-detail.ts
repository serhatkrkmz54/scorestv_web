import "server-only";
import { backendJson } from "./backend";
import type { VolleyballGameDetailResponse } from "./volleyball-detail-types";
import type { ServerFetchResult } from "./team-detail";

export async function fetchVolleyballDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
): Promise<ServerFetchResult<VolleyballGameDetailResponse>> {
  const r = await backendJson<VolleyballGameDetailResponse>(
    `/api/v1/volleyball/games/detail/${encodeURIComponent(slug)}?lang=${lang}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}
