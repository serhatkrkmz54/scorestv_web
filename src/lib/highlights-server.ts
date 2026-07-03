import "server-only";
import type { Highlight } from "./highlights-types";

const BASE = process.env.BACKEND_URL ?? "http://localhost:8080";

/**
 * Sunucu tarafı highlight fetch — yalnız VideoObject JSON-LD (SEO) için.
 * Backend {@code /api/v1/highlights/fixtures/{id}} ülkeden bağımsız ham listeyi
 * döner; SEO'da geo/embeddable önemsiz (video meta yeter). Next katmanında
 * cache'lenir (Highlightly kotasını + backend cache'ini korur). Sadece BİTEN
 * maçlarda dolu döner; hata/erişilemezse boş liste.
 */
export async function fetchHighlightsServer(
  fixtureId: number | string,
): Promise<Highlight[]> {
  try {
    const res = await fetch(
      `${BASE}/api/v1/highlights/fixtures/${encodeURIComponent(String(fixtureId))}`,
      {
        headers: { "Content-Type": "application/json" },
        // 1 saat cache — biten maç özetleri sık değişmez; SSR yükünü azaltır.
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const j = (await res.json()) as Highlight[];
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}
