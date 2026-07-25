import type { Metadata } from "next";
import { VolleyballHome } from "@/components/home/VolleyballHome";
import { ScrollToTop } from "@/components/home/ScrollToTop";
import { resolveLang } from "@/lib/lang-server";
import { fetchSportHomeServer } from "@/lib/home-server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

// /voleybol ile ayni icerik — Ingilizce URL alternatifi.
export function generateMetadata(): Metadata {
  const title = "Live Volleyball Scores, Standings & Results | Scores TV";
  const description =
    "Efeler Ligi, Sultanlar Ligi, Italian SuperLega and more: live volleyball scores, set scores, standings and match results.";
  const canonical = `${SITE}/volleyball`;
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
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function VolleyballPage() {
  const lang = await resolveLang();
  const home = await fetchSportHomeServer("volleyball", lang);
  return (
    <>
      <h1 className="sr-only">Live Volleyball Scores and Standings</h1>
      <VolleyballHome
        initialDates={home.dates}
        initialDay={home.day}
        initialDate={home.date}
      />
      <ScrollToTop />
    </>
  );
}
