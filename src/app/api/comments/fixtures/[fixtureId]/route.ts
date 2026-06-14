import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { CommentPageResponse } from "@/lib/comment-types";

/**
 * Yorum listesi BFF proxy — read-only (web v1).
 * Backend GET /api/v1/comments/fixtures/{fixtureId}?page&size&sort
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ fixtureId: string }> },
) {
  const { fixtureId } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const page = sp.get("page") ?? "0";
  const size = sp.get("size") ?? "30";
  const sort = sp.get("sort") ?? "newest";

  const path = `/api/v1/comments/fixtures/${encodeURIComponent(
    fixtureId,
  )}?page=${encodeURIComponent(page)}&size=${encodeURIComponent(
    size,
  )}&sort=${encodeURIComponent(sort)}`;

  const r = await backendJson<CommentPageResponse>(path);
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Yorumlar alınamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
