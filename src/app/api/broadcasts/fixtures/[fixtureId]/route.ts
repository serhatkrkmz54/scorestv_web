import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { Broadcast } from "@/lib/broadcast-types";

/** İstek başlıklarından kullanıcının ülke kodunu (ISO alfa-2) çıkar. */
function countryFrom(req: NextRequest): string | null {
  const h = req.headers;
  const raw =
    h.get("cf-ipcountry") ?? // Cloudflare
    h.get("x-vercel-ip-country") ?? // Vercel
    h.get("x-country") ??
    "";
  const c = raw.trim().toUpperCase();
  if (c.length !== 2 || c === "XX" || c === "T1") return null;
  return c;
}

/**
 * Maç TV yayını BFF proxy — backend TheSportsDB proxy'sine gider (anahtar
 * backend'de, sonuç cache'li). Kullanıcının ülkesini iletir ki o ülkenin
 * kanalları öne alınsın (BFF server-to-server olduğu için backend IP'yi göremez).
 * Backend GET /api/v1/broadcasts/fixtures/{fixtureId}?country=XX
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ fixtureId: string }> },
) {
  const { fixtureId } = await ctx.params;
  const country = countryFrom(req);
  const qs = country ? `?country=${encodeURIComponent(country)}` : "";
  const r = await backendJson<Broadcast[]>(
    `/api/v1/broadcasts/fixtures/${encodeURIComponent(fixtureId)}${qs}`,
  );
  if (!r.ok || !r.body) {
    // Yayın bilgisi olmaması hata değil — boş liste dön.
    return NextResponse.json([]);
  }
  return NextResponse.json(r.body);
}
