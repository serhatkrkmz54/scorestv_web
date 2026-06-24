import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { VolleyballGameDetailResponse } from "@/lib/volleyball-detail-types";

// Voleybol mac detay BFF proxy. Client-side refresh + retry icin.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const refresh = sp.get("refresh") === "true";

  const path = refresh
    ? `/api/v1/volleyball/games/detail/${encodeURIComponent(slug)}/refresh?lang=${lang}`
    : `/api/v1/volleyball/games/detail/${encodeURIComponent(slug)}?lang=${lang}`;

  const r = await backendJson<VolleyballGameDetailResponse>(path, {
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
