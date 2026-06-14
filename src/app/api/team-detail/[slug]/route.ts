import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { TeamDetailResponse } from "@/lib/team-detail-types";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const season = sp.get("season");

  const qs = new URLSearchParams({ lang });
  if (season) qs.set("season", season);

  const r = await backendJson<TeamDetailResponse>(
    `/api/v1/teams/${encodeURIComponent(slug)}?${qs.toString()}`,
    { method: "GET" },
  );
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Takim detay alinamadi." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
