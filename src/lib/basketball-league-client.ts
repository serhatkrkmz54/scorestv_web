"use client";

import type { BasketballLeagueDetailResponse } from "./basketball-league-types";

// Client-side basketbol lig detay fetch — BFF /api/basketball/league/[slug].
// Sezon degisiminde tekrar cagrilir.
export async function fetchBasketballLeagueDetailClient(
  slug: string,
  lang: "tr" | "en" = "tr",
  opts: { season?: string | null } = {},
): Promise<BasketballLeagueDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (opts.season) qs.set("season", opts.season);
  const r = await fetch(
    `/api/basketball/league/${encodeURIComponent(slug)}?${qs.toString()}`,
    { cache: "no-store" },
  );
  if (!r.ok) {
    throw new Error(`Basketbol lig detay alinamadi (${r.status})`);
  }
  return (await r.json()) as BasketballLeagueDetailResponse;
}
