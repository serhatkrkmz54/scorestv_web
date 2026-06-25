import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { BasketballStandingsPageResponse } from "@/lib/basketball-league-types";

interface Ctx {
  params: Promise<{ slug: string }>;
}

// Basketbol lig puan durumu BFF — backend
// /api/v1/basketball/leagues/{slug}/standings.
export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const season = sp.get("season");

  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);

  const r = await backendJson<BasketballStandingsPageResponse>(
    `/api/v1/basketball/leagues/${encodeURIComponent(slug)}/standings?${qs.toString()}`,
    { method: "GET" },
  );
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Puan durumu alınamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
