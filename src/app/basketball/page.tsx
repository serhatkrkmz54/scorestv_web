import type { Metadata } from "next";
import { BasketballHome } from "@/components/home/BasketballHome";
import { ScrollToTop } from "@/components/home/ScrollToTop";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

export function generateMetadata(): Metadata {
  const title = "Live Basketball Scores, Standings and Games | ScoresTV";
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

export default function BasketballPage() {
  return (
    <>
      <h1 className="sr-only">Live Basketball Scores and Standings</h1>
      <BasketballHome />
      <ScrollToTop />
    </>
  );
}
