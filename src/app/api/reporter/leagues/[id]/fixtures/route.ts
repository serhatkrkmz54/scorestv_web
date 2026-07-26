import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

interface Ctx {
  params: Promise<{ id: string }>;
}

// Atanmış ligin maçları — listele / oluştur.
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const r = await authorizedBackendJson<unknown>(
    `/api/v1/reporter/leagues/${encodeURIComponent(id)}/fixtures`,
  );
  if (r.unauthorized) {
    return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? { message: "Alınamadı." }, { status: r.status });
  }
  return NextResponse.json(r.body);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }
  const r = await authorizedBackendJson<unknown>(
    `/api/v1/reporter/leagues/${encodeURIComponent(id)}/fixtures`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  if (r.unauthorized) {
    return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? { message: "Oluşturulamadı." }, { status: r.status });
  }
  return NextResponse.json(r.body, { status: 201 });
}
