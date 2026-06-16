import { fetchCounts, sitemapFiles, indexXml } from "@/lib/sitemap-data";

// Sitemap INDEX — /sitemap.xml. Stilli (XSL) + alt sitemap'lere isaret eder.
// force-dynamic: her zaman canli counts cek (cache'lenmis 0/404 sorununu onler).
// CF/nginx Cache-Control ile yine cache'lenir, backend yorulmaz.
export const dynamic = "force-dynamic";

export async function GET() {
  const files = sitemapFiles(await fetchCounts());
  return new Response(indexXml(files), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache yok — yeni eklenen veriler aninda sitemap'e girsin.
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
