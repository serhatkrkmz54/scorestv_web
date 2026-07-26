import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

interface Ctx {
  params: Promise<{ id: string; eventId: string }>;
}

// Olay sil (yanlış giriş) — gol olayıysa skor da geri alınır.
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id, eventId } = await ctx.params;
  const r = await authorizedBackendJson<unknown>(
    `/api/v1/reporter/fixtures/${encodeURIComponent(id)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE" },
  );
  if (r.unauthorized) return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  if (!r.ok || !r.body) return NextResponse.json(r.body ?? { message: "Silinemedi." }, { status: r.status });
  return NextResponse.json(r.body);
}
