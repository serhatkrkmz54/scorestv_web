import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { VolleyballLeagueDetailResponse } from "@/lib/volleyball-league-types";

interface Ctx {
  params: Promise<{ slug: string }>;
}

// Voleybol lig detay BFF — backend /api/v1/volleyball/leagues/{slug}/detail.
// refresh=true → backend /detail/refresh (POST, cache evict).
export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const season = sp.get("season");
  const refresh = sp.get("refresh") === "true";

  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);

  const path = refresh
    ? `/api/v1/volleyball/leagues/${encodeURIComponent(slug)}/detail/refresh?${qs.toString()}`
    : `/api/v1/volleyball/leagues/${encodeURIComponent(slug)}/detail?${qs.toString()}`;

  const r = await backendJson<VolleyballLeagueDetailResponse>(path, {
    method: refresh ? "POST" : "GET",
  });
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Lig detay alınamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
