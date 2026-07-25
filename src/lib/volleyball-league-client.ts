"use client";

import type { VolleyballLeagueDetailResponse } from "./volleyball-league-types";

// Client-side voleybol lig detay fetch — BFF /api/volleyball/league/[slug].
// Sezon degisiminde tekrar cagrilir.
export async function fetchVolleyballLeagueDetailClient(
  slug: string,
  lang: "tr" | "en" = "tr",
  opts: { season?: string | null } = {},
): Promise<VolleyballLeagueDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (opts.season) qs.set("season", opts.season);
  const r = await fetch(
    `/api/volleyball/league/${encodeURIComponent(slug)}?${qs.toString()}`,
    { cache: "no-store" },
  );
  if (!r.ok) {
    throw new Error(`Voleybol lig detay alinamadi (${r.status})`);
  }
  return (await r.json()) as VolleyballLeagueDetailResponse;
}
