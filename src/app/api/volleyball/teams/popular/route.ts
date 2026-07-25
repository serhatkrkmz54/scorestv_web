import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { PopularTeam } from "@/lib/fixtures-types";

// Voleybol sol ray "Populer Takimlar" — backend config'inden
// (scorestv.volleyball.serving.popular-team-ids). Basketbol BFF'inin esi.
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "tr";
  const r = await backendJson<PopularTeam[]>(
    `/api/v1/volleyball/teams/popular?lang=${lang}`,
    { method: "GET" },
  );
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? [], { status: r.ok ? 200 : r.status });
  }
  return NextResponse.json(r.body);
}
