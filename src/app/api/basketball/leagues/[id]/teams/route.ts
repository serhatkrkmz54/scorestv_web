import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";

interface Ctx {
  params: Promise<{ id: string }>;
}

// Bir basketbol liginin takim listesi (hafif) — backend
// /api/v1/basketball/leagues/{id}/teams. Sol ray "Takimlar" bolumu kullanir.
// Backend BasketballLeagueTeamView: { id, name, nameTr, shortCode, logoUrl }.
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const season = sp.get("season");

  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);

  const r = await backendJson<unknown[]>(
    `/api/v1/basketball/leagues/${encodeURIComponent(id)}/teams?${qs.toString()}`,
    { method: "GET" },
  );
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? [], { status: r.ok ? 200 : r.status });
  }
  return NextResponse.json(r.body);
}
