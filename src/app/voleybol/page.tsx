import type { Metadata } from "next";
import { VolleyballHome } from "@/components/home/VolleyballHome";
import { ScrollToTop } from "@/components/home/ScrollToTop";
import { resolveLang } from "@/lib/lang-server";
import { fetchSportHomeServer } from "@/lib/home-server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

export function generateMetadata(): Metadata {
  const title = "Canlı Voleybol Skorları, Puan Durumları ve Maçlar | Scores TV";
  const description =
    "Efeler Ligi, Sultanlar Ligi, İtalya SuperLega ve daha fazlası: canlı voleybol skorları, set skorları, puan durumları ve maç sonuçları.";
  const canonical = `${SITE}/voleybol`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { tr: `${SITE}/voleybol`, en: `${SITE}/volleyball` },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function VoleybolPage() {
  // SSR: ilk gün voleybol maçları HTML'e gömülür (Google "Yükleniyor" görmesin).
  const lang = await resolveLang();
  const home = await fetchSportHomeServer("volleyball", lang);
  return (
    <>
      <h1 className="sr-only">Canlı Voleybol Skorları ve Puan Durumları</h1>
      <VolleyballHome
        initialDates={home.dates}
        initialDay={home.day}
        initialDate={home.date}
      />
      <ScrollToTop />
    </>
  );
}
