import { fetchCounts, sitemapFiles, indexXml } from "@/lib/sitemap-data";

// Sitemap INDEX — /sitemap.xml. Stilli (XSL) + alt sitemap'lere isaret eder.
// force-dynamic: Next kendi katmaninda cache'lemesin; asil cache CDN'de
// (s-maxage). Backend'e ulasilamazsa 503 — Google "gecici" der, eski
// sitemap bilgisini korur (kucultulmus/bos 200 vermek URL kaybi sinyaliydi).
export const dynamic = "force-dynamic";

// CDN 1 saat cache'ler; sonrasinda 1 gun boyunca bayat kopyayi sunarken
// arkada tazeler. Googlebot sitemap taramalari backend'i artik dovmez.
const CACHE_OK = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
  const counts = await fetchCounts();
  if (!counts) {
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "300" },
    });
  }
  return new Response(indexXml(sitemapFiles(counts)), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": CACHE_OK,
    },
  });
}
