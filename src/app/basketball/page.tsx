import type { Metadata } from "next";
import { BasketballHome } from "@/components/home/BasketballHome";
import { ScrollToTop } from "@/components/home/ScrollToTop";
import { resolveLang } from "@/lib/lang-server";
import { fetchSportHomeServer } from "@/lib/home-server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

export function generateMetadata(): Metadata {
  const title = "Live Basketball Scores, Standings and Games | Scores TV";
  const description =
    "NBA, EuroLeague, Turkish Super League and more: live basketball scores, quarter scores, standings and match statistics.";
  const canonical = `${SITE}/basketball`;
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
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function BasketballPage() {
  // SSR: today's basketball games rendered into HTML (no "Loading…" for Google).
  const lang = await resolveLang();
  const home = await fetchSportHomeServer("basketball", lang);
  return (
    <>
      <h1 className="sr-only">Live Basketball Scores and Standings</h1>
      <BasketballHome
        initialDates={home.dates}
        initialDay={home.day}
        initialDate={home.date}
      />
      <ScrollToTop />
    </>
  );
}
