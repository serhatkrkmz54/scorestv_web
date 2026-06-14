"use client";

import type { MatchDetailResponse } from "./match-detail-types";

/**
 * Client-side maç detay fetch — BFF proxy üzerinden ({@code /api/match-detail/[slug]}).
 * Server Component ilk yüklemeyi {@code fetchMatchDetailServer} ile yapar;
 * client tarafı WebSocket reconnect, pull-to-refresh ve thin-response silent
 * retry için bunu çağırır.
 */
export async function fetchMatchDetailClient(
  slug: string,
  lang: "tr" | "en" = "tr",
  opts: { forceRefresh?: boolean } = {},
): Promise<MatchDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (opts.forceRefresh) qs.set("refresh", "true");
  const r = await fetch(`/api/match-detail/${encodeURIComponent(slug)}?${qs}`, {
    cache: "no-store",
  });
  if (!r.ok) {
    throw new Error(`Maç detay alınamadı (${r.status})`);
  }
  return (await r.json()) as MatchDetailResponse;
}
