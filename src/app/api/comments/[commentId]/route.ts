import { NextResponse } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

/**
 * Yorum sil — auth gerektirir (backend yalnızca sahibinin silmesine izin verir).
 * Backend DELETE /api/v1/comments/{commentId}
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await ctx.params;
  const r = await authorizedBackendJson(
    `/api/v1/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" },
  );
  if (r.unauthorized) {
    return NextResponse.json(
      { message: "Bu işlem için giriş yapın." },
      { status: 401 },
    );
  }
  if (!r.ok) {
    return NextResponse.json(
      r.body ?? { message: "Yorum silinemedi." },
      { status: r.status },
    );
  }
  return NextResponse.json({ ok: true });
}
