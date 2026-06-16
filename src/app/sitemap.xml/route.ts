import { fetchCounts, sitemapFiles, indexXml } from "@/lib/sitemap-data";

// Sitemap INDEX — /sitemap.xml. Stilli (XSL) + alt sitemap'lere isaret eder.
export const revalidate = 3600;

export async function GET() {
  const files = sitemapFiles(await fetchCounts());
  return new Response(indexXml(files), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
