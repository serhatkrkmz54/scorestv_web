"use client";

import type { BasketballTeamDetailResponse } from "./basketball-team-types";

// Client-side basketbol takim detay fetch — BFF /api/basketball/team/[slug].
export async function fetchBasketballTeamDetailClient(
  slug: string,
  lang: "tr" | "en" = "tr",
  opts: { season?: string | null } = {},
): Promise<BasketballTeamDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (opts.season) qs.set("season", opts.season);
  const r = await fetch(
    `/api/basketball/team/${encodeURIComponent(slug)}?${qs.toString()}`,
    { cache: "no-store" },
  );
  if (!r.ok) {
    throw new Error(`Basketbol takim detay alinamadi (${r.status})`);
  }
  return (await r.json()) as BasketballTeamDetailResponse;
}
