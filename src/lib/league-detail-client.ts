"use client";

import type { LeagueDetailResponse } from "./league-detail-types";

/**
 * Client-side lig detay fetch — BFF proxy /api/league-detail/[slug].
 * Sezon degisiminde tekrar cagrilir.
 */
export async function fetchLeagueDetailClient(
  slug: string,
  lang: "tr" | "en" = "tr",
  opts: { season?: number | null } = {},
): Promise<LeagueDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (opts.season != null) qs.set("season", String(opts.season));
  const r = await fetch(
    `/api/league-detail/${encodeURIComponent(slug)}?${qs.toString()}`,
    { cache: "no-store" },
  );
  if (!r.ok) {
    throw new Error(`Lig detay alinamadi (${r.status})`);
  }
  return (await r.json()) as LeagueDetailResponse;
}
