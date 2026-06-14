import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { UefaCountryRankingResponse } from "@/lib/rankings-types";

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "tr";
  const r = await backendJson<UefaCountryRankingResponse>(`/api/v1/rankings/uefa/countries?lang=${lang}`);
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? { message: "UEFA Countries siralama alinamadi." }, { status: r.status });
  }
  return NextResponse.json(r.body);
}
