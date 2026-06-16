import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import {
  authorizedBackendJson,
  getForwardAccessToken,
} from "@/lib/auth-server";
import type { CommentPageResponse, CommentView } from "@/lib/comment-types";

/**
 * Yorum listesi (GET) + yeni yorum/yanıt (POST) BFF proxy.
 * Backend:
 *   GET  /api/v1/comments/fixtures/{fixtureId}?page&size&sort
 *   POST /api/v1/comments/fixtures/{fixtureId}   body: { content, parentId? }
 *
 * GET opsiyonel-auth: oturum varsa token iletilir ki backend likedByMe / isMine
 * doğru dönsün. POST auth gerektirir.
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

  // Oturum varsa token ilet — likedByMe / isMine doğru dönsün (anonimse atlanır).
  const token = await getForwardAccessToken();
  const r = await backendJson<CommentPageResponse>(
    path,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Yorumlar alınamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ fixtureId: string }> },
) {
  const { fixtureId } = await ctx.params;

  let payload: { content?: string; parentId?: number } = {};
  try {
    payload = (await req.json()) as { content?: string; parentId?: number };
  } catch {
    payload = {};
  }
  const content = (payload.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ message: "Yorum boş olamaz." }, { status: 400 });
  }

  const path = `/api/v1/comments/fixtures/${encodeURIComponent(fixtureId)}`;
  const r = await authorizedBackendJson<CommentView>(path, {
    method: "POST",
    body: JSON.stringify({
      content,
      ...(payload.parentId ? { parentId: payload.parentId } : {}),
    }),
  });

  if (r.unauthorized) {
    return NextResponse.json(
      { message: "Yorum yapmak için giriş yapın." },
      { status: 401 },
    );
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Yorum gönderilemedi." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body, { status: 201 });
}
