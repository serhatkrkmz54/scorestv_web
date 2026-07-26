import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

interface Ctx {
  params: Promise<{ id: string; side: string }>;
}

// Kadro — getir / kaydet (side: home | away).
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id, side } = await ctx.params;
  const r = await authorizedBackendJson<unknown>(
    `/api/v1/reporter/fixtures/${encodeURIComponent(id)}/lineups/${encodeURIComponent(side)}`,
  );
  if (r.unauthorized) return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  if (!r.ok || !r.body) return NextResponse.json(r.body ?? { message: "Alınamadı." }, { status: r.status });
  return NextResponse.json(r.body);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id, side } = await ctx.params;
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }
  const r = await authorizedBackendJson<unknown>(
    `/api/v1/reporter/fixtures/${encodeURIComponent(id)}/lineups/${encodeURIComponent(side)}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
  if (r.unauthorized) return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  if (!r.ok || !r.body) return NextResponse.json(r.body ?? { message: "Kaydedilemedi." }, { status: r.status });
  return NextResponse.json(r.body);
}
