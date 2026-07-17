import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import {
  authorizedBackendJson,
  getForwardAccessToken,
} from "@/lib/auth-server";
import type { CommentPageResponse, CommentView } from "@/lib/comment-types";

/**
 * Haber yorumları (GET) + yeni yorum/yanıt (POST) BFF proxy.
 * Backend:
 *   GET  /api/v1/comments/news/{newsId}?page&size&sort
 *   POST /api/v1/comments/news/{newsId}   body: { content, parentId? }
 *
 * Maç yorum sistemi "news" segmenti — newsId = haberin sayısal id'si.
 * GET opsiyonel-auth (likedByMe / isMine için token iletilir); POST auth gerektirir.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ newsId: string }> },
) {
  const { newsId } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const page = sp.get("page") ?? "0";
  const size = sp.get("size") ?? "30";
  const sort = sp.get("sort") ?? "newest";

  const path = `/api/v1/comments/news/${encodeURIComponent(
    newsId,
  )}?page=${encodeURIComponent(page)}&size=${encodeURIComponent(
    size,
  )}&sort=${encodeURIComponent(sort)}`;

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
  ctx: { params: Promise<{ newsId: string }> },
) {
  const { newsId } = await ctx.params;

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

  const path = `/api/v1/comments/news/${encodeURIComponent(newsId)}`;
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
