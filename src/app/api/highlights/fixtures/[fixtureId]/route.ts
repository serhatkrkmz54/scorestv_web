import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { Highlight } from "@/lib/highlights-types";

/** İstek başlıklarından kullanıcının ülke kodunu (ISO alfa-2) çıkar. */
function countryFrom(req: NextRequest): string | null {
  const h = req.headers;
  const raw =
    h.get("cf-ipcountry") ?? // Cloudflare
    h.get("x-vercel-ip-country") ?? // Vercel
    h.get("x-country") ??
    "";
  const c = raw.trim().toUpperCase();
  // Cloudflare bilinmeyen için "XX", Tor için "T1" döner — geçersiz say.
  if (c.length !== 2 || c === "XX" || c === "T1") return null;
  return c;
}

/**
 * Maç highlight/özet BFF proxy — backend Highlightly proxy'sine gider
 * (anahtar backend'de, sonuç cache'li). Yalnız biten maçlarda dolu döner.
 * Kullanıcının ülkesini backend'e iletir ki coğrafi engelli highlight'lar
 * gömülmesin (BFF server-to-server çağrı olduğu için backend kullanıcının IP'sini
 * göremez; ülkeyi biz aktarırız).
 * Backend GET /api/v1/highlights/fixtures/{fixtureId}?country=XX
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ fixtureId: string }> },
) {
  const { fixtureId } = await ctx.params;
  const country = countryFrom(req);
  const qs = country ? `?country=${encodeURIComponent(country)}` : "";
  const r = await backendJson<Highlight[]>(
    `/api/v1/highlights/fixtures/${encodeURIComponent(fixtureId)}${qs}`,
  );
  if (!r.ok || !r.body) {
    // Highlight olmaması hata değil — boş liste dön.
    return NextResponse.json([]);
  }
  return NextResponse.json(r.body);
}
