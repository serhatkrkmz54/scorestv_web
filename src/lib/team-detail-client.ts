"use client";

import type { TeamDetailResponse } from "./team-detail-types";

/**
 * Client-side takim detay fetch — BFF proxy /api/team-detail/[slug].
 * Sezon degisiminde tekrar cagrilir.
 */
export async function fetchTeamDetailClient(
  slug: string,
  lang: "tr" | "en" = "tr",
  opts: { season?: number | null } = {},
): Promise<TeamDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (opts.season != null) qs.set("season", String(opts.season));
  const r = await fetch(
    `/api/team-detail/${encodeURIComponent(slug)}?${qs.toString()}`,
    { cache: "no-store" },
  );
  if (!r.ok) {
    throw new Error(`Takim detay alinamadi (${r.status})`);
  }
  return (await r.json()) as TeamDetailResponse;
}
