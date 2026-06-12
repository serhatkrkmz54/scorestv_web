import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { PopularCountry } from "@/lib/fixtures-types";

// Sol ray "Ülkeler" — backend config'inden (popular-country-ids).
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "tr";
  const r = await backendJson<PopularCountry[]>(`/api/v1/countries/popular?lang=${lang}`, {
    method: "GET",
  });
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? [], { status: r.ok ? 200 : r.status });
  }
  return NextResponse.json(r.body);
}
