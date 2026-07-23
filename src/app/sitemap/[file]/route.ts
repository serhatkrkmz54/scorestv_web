import { entriesFor, urlsetXml } from "@/lib/sitemap-data";

// Alt sitemap'ler — /sitemap/teams-0.xml, /sitemap/players-3.xml, /sitemap/static.xml ...
// Backend'e ulasilamazsa 503 (bos 200 "URL'ler kaldirildi" sinyali olurdu);
// basarili cevap CDN'de 1 saat cache'lenir (backend yuku).
export const dynamic = "force-dynamic";

const CACHE_OK = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const name = file.replace(/\.xml$/i, "");
  const entries = await entriesFor(name);
  if (entries === null) {
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "300" },
    });
  }
  return new Response(urlsetXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": CACHE_OK,
    },
  });
}
