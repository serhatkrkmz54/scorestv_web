"use client";

import type { PlayerDetailResponse } from "./player-detail-types";

/**
 * Client-side oyuncu detay fetch — BFF proxy /api/player-detail/[slug].
 * Sezon degisiminde tekrar cagrilir.
 */
export async function fetchPlayerDetailClient(
  slug: string,
  lang: "tr" | "en" = "tr",
  opts: { season?: number | null } = {},
): Promise<PlayerDetailResponse> {
  const qs = new URLSearchParams({ lang });
  if (opts.season != null) qs.set("season", String(opts.season));
  const r = await fetch(
    `/api/player-detail/${encodeURIComponent(slug)}?${qs.toString()}`,
    { cache: "no-store" },
  );
  if (!r.ok) {
    throw new Error(`Oyuncu detay alinamadi (${r.status})`);
  }
  return (await r.json()) as PlayerDetailResponse;
}
