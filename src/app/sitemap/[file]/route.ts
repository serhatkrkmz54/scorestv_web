import { entriesFor, urlsetXml } from "@/lib/sitemap-data";

// Alt sitemap'ler — /sitemap/teams-0.xml, /sitemap/players-3.xml, /sitemap/static.xml ...
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const name = file.replace(/\.xml$/i, "");
  return new Response(urlsetXml(await entriesFor(name)), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache yok — yeni veriler aninda gorunsun.
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
