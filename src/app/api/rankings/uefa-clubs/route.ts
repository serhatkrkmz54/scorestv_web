import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { UefaClubRankingResponse } from "@/lib/rankings-types";

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "tr";
  const r = await backendJson<UefaClubRankingResponse>(`/api/v1/rankings/uefa/clubs?lang=${lang}`);
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? { message: "UEFA Clubs siralama alinamadi." }, { status: r.status });
  }
  return NextResponse.json(r.body);
}
