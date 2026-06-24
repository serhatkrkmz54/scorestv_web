import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { BasketballGameDetailResponse } from "@/lib/basketball-detail-types";

// Basketbol mac detay BFF proxy. Client-side refresh + retry icin.
// refresh=true → backend /refresh (POST, cache evict + lazy sync force).
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const refresh = sp.get("refresh") === "true";

  const path = refresh
    ? `/api/v1/basketball/games/detail/${encodeURIComponent(slug)}/refresh?lang=${lang}`
    : `/api/v1/basketball/games/detail/${encodeURIComponent(slug)}?lang=${lang}`;

  const r = await backendJson<BasketballGameDetailResponse>(path, {
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
