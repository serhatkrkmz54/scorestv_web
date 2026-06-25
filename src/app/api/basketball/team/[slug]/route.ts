import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { BasketballTeamDetailResponse } from "@/lib/basketball-team-types";

interface Ctx {
  params: Promise<{ slug: string }>;
}

// Basketbol takim detay BFF — backend /api/v1/basketball/teams/{slug}.
// refresh=true → backend /refresh (POST, cache evict + lazy sync).
export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const season = sp.get("season");
  const refresh = sp.get("refresh") === "true";

  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);

  const path = refresh
    ? `/api/v1/basketball/teams/${encodeURIComponent(slug)}/refresh?${qs.toString()}`
    : `/api/v1/basketball/teams/${encodeURIComponent(slug)}?${qs.toString()}`;

  const r = await backendJson<BasketballTeamDetailResponse>(path, {
    method: refresh ? "POST" : "GET",
  });
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Takım detay alınamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
