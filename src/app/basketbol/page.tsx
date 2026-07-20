import type { Metadata } from "next";
import { BasketballHome } from "@/components/home/BasketballHome";
import { ScrollToTop } from "@/components/home/ScrollToTop";
import { resolveLang } from "@/lib/lang-server";
import { fetchSportHomeServer } from "@/lib/home-server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

export function generateMetadata(): Metadata {
  const title = "Canlı Basketbol Skorları, Puan Durumları ve Maçlar | Scores TV";
  const description =
    "NBA, EuroLeague, Basketbol Süper Ligi ve daha fazlası: canlı basketbol skorları, çeyrek skorları, puan durumları ve maç istatistikleri.";
  const canonical = `${SITE}/basketbol`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { tr: `${SITE}/basketbol`, en: `${SITE}/basketball` },
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

export default async function BasketbolPage() {
  // SSR: ilk gün basketbol maçları HTML'e gömülür (Google "Yükleniyor" görmesin).
  const lang = await resolveLang();
  const home = await fetchSportHomeServer("basketball", lang);
  return (
    <>
      <h1 className="sr-only">Canlı Basketbol Skorları ve Puan Durumları</h1>
      <BasketballHome
        initialDates={home.dates}
        initialDay={home.day}
        initialDate={home.date}
      />
      <ScrollToTop />
    </>
  );
}
