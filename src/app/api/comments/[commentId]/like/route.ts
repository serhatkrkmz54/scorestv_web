import { NextResponse } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

/**
 * Yorum beğeni toggle — auth gerektirir.
 * Backend POST /api/v1/comments/{commentId}/like → { liked, likeCount }
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await ctx.params;
  const r = await authorizedBackendJson<{ liked: boolean; likeCount: number }>(
    `/api/v1/comments/${encodeURIComponent(commentId)}/like`,
    { method: "POST" },
  );
  if (r.unauthorized) {
    return NextResponse.json(
      { message: "Beğenmek için giriş yapın." },
      { status: 401 },
    );
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "İşlem başarısız." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
