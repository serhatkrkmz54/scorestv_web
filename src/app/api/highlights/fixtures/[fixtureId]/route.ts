import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { Highlight } from "@/lib/highlights-types";

/**
 * Maç highlight/özet BFF proxy — backend Highlightly proxy'sine gider
 * (anahtar backend'de, sonuç cache'li). Yalnız biten maçlarda dolu döner.
 * Backend GET /api/v1/highlights/fixtures/{fixtureId}
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ fixtureId: string }> },
) {
  const { fixtureId } = await ctx.params;
  const r = await backendJson<Highlight[]>(
    `/api/v1/highlights/fixtures/${encodeURIComponent(fixtureId)}`,
  );
  if (!r.ok || !r.body) {
    // Highlight olmaması hata değil — boş liste dön.
    return NextResponse.json([]);
  }
  return NextResponse.json(r.body);
}
