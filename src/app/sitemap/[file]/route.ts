import { entriesFor, urlsetXml } from "@/lib/sitemap-data";

// Alt sitemap'ler — /sitemap/teams-0.xml, /sitemap/players-3.xml, /sitemap/static.xml ...
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const name = file.replace(/\.xml$/i, "");
  return new Response(urlsetXml(await entriesFor(name)), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
