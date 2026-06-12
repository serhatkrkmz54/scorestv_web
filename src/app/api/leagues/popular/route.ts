import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { PopularLeague } from "@/lib/fixtures-types";

// Sol ray "Popüler Ligler" — backend config'inden (popular-league-ids).
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "tr";
  const r = await backendJson<PopularLeague[]>(`/api/v1/leagues/popular?lang=${lang}`, {
    method: "GET",
  });
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? [], { status: r.ok ? 200 : r.status });
  }
  return NextResponse.json(r.body);
}
