import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

interface Ctx {
  params: Promise<{ id: string }>;
}

// Canlı konsol aksiyonu (START/GOAL_HOME/.../FINISH).
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }
  const r = await authorizedBackendJson<unknown>(
    `/api/v1/reporter/fixtures/${encodeURIComponent(id)}/actions`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  if (r.unauthorized) {
    return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? { message: "İşlem başarısız." }, { status: r.status });
  }
  return NextResponse.json(r.body);
}
