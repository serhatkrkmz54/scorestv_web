import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HomeProvider } from "@/context/home-context";
import { HomeFixtures } from "@/components/home/HomeFixtures";
import { LeftRail } from "@/components/home/LeftRail";
import { RightRail } from "@/components/home/RightRail";
import { ScrollToTop } from "@/components/home/ScrollToTop";

// Anasayfa title/description dile gore (stv_lang cookie). Varsayilan: Ingilizce.
export async function generateMetadata(): Promise<Metadata> {
  const isTr = (await cookies()).get("stv_lang")?.value === "tr";
  const title = isTr
    ? "ScoresTV — Canlı Skor & İstatistik"
    : "ScoresTV — Live Scores & Stats";
  const description = isTr
    ? "Futbol, basketbol, tenis ve voleybol canlı skorları, puan durumları, istatistikler ve daha fazlası."
    : "Live football, basketball, tennis and volleyball scores, standings, statistics and more.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function HomePage() {
  const isTr = (await cookies()).get("stv_lang")?.value === "tr";
  const h1 = isTr
    ? "Canlı Skorlar, Puan Durumları ve Maç İstatistikleri"
    : "Live Scores, Standings and Match Statistics";
  return (
    <HomeProvider>
      {/* SEO: gorsel gizli ana baslik (robotlar gorur). */}
      <h1 className="sr-only">{h1}</h1>
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <HomeFixtures />
        <aside className="rail-right">
          <RightRail />
        </aside>
      </div>
      <ScrollToTop />
    </HomeProvider>
  );
}
