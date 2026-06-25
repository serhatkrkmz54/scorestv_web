import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { PopularLeague } from "@/lib/fixtures-types";

// Basketbol sol ray "Populer Ligler" — backend config'inden
// (scorestv.basketball.serving.popular-league-ids). Futbol /api/leagues/popular
// BFF'inin esi. Shape: {id,name,slug,logo}[] (country alanlari opsiyonel/null).
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "tr";
  const r = await backendJson<PopularLeague[]>(
    `/api/v1/basketball/leagues/popular?lang=${lang}`,
    { method: "GET" },
  );
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? [], { status: r.ok ? 200 : r.status });
  }
  return NextResponse.json(r.body);
}
