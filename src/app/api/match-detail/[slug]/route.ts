import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { MatchDetailResponse } from "@/lib/match-detail-types";

/**
 * Maç detay BFF proxy. Client-side refresh ve WebSocket reconnect sonrası
 * silent refetch için kullanılır. Server Component'tan ilk yükleme
 * doğrudan {@code backendJson} kullanır (bkz. mac/[slug]/page.tsx).
 *
 * Query params:
 *   - lang: "tr" | "en" (default "tr")
 *   - refresh: "true" → backend force refresh (cache evict + lazy sync force)
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const refresh = sp.get("refresh") === "true";

  const path = refresh
    ? `/api/v1/fixtures/${encodeURIComponent(slug)}/refresh?lang=${lang}`
    : `/api/v1/fixtures/${encodeURIComponent(slug)}?lang=${lang}`;

  const r = await backendJson<MatchDetailResponse>(path, {
    method: refresh ? "POST" : "GET",
  });

  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Maç verisi alınamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
