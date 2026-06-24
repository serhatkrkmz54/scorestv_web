import "server-only";
import { backendJson } from "./backend";
import type { BasketballGameDetailResponse } from "./basketball-detail-types";
import type { ServerFetchResult } from "./team-detail";

export async function fetchBasketballDetailServer(
  slug: string,
  lang: "tr" | "en" = "tr",
): Promise<ServerFetchResult<BasketballGameDetailResponse>> {
  const r = await backendJson<BasketballGameDetailResponse>(
    `/api/v1/basketball/games/detail/${encodeURIComponent(slug)}?lang=${lang}`,
  );
  return {
    data: r.ok && r.body ? r.body : null,
    status: r.status,
  };
}
