import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { MatchInsight } from "@/lib/insight-types";

/**
 * "AI Analiz" BFF — backend `/api/v1/fixtures/{slug}/insight` proxy'si.
 * slug "m-{fixtureId}" veya tam slug olabilir; backend sondaki id'yi okur.
 * Veri yoksa/hata olursa {available:false} döner (istemci sessizce gizler).
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const lang = req.nextUrl.searchParams.get("lang") ?? "en";
  const r = await backendJson<MatchInsight>(
    `/api/v1/fixtures/${encodeURIComponent(slug)}/insight?lang=${encodeURIComponent(lang)}`,
  );
  if (!r.ok || !r.body) {
    return NextResponse.json({ available: false } satisfies MatchInsight);
  }
  return NextResponse.json(r.body);
}
