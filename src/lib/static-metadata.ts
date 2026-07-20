import "server-only";
import type { Metadata } from "next";
import { cookies } from "next/headers";

// Statik sayfalar (client component) icin sayfa-ozel metadata uretir.
// Route-segment layout.tsx'lerden cagrilir; dile gore (stv_lang cookie) baslik.
export async function staticPageMetadata(
  trTitle: string,
  enTitle: string,
  trDesc: string,
  enDesc: string,
  canonical: string,
): Promise<Metadata> {
  const isTr = (await cookies()).get("stv_lang")?.value === "tr";
  const title = `${isTr ? trTitle : enTitle} | Scores TV`;
  const description = isTr ? trDesc : enDesc;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  };
}
