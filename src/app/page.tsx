import { HomeProvider } from "@/context/home-context";
import { HomeMain } from "@/components/home/HomeMain";
import { HomeShell } from "@/components/home/HomeShell";
import { LeftRail } from "@/components/home/LeftRail";
import { RightRail } from "@/components/home/RightRail";
import { ScrollToTop } from "@/components/home/ScrollToTop";
import { resolveLang } from "@/lib/lang-server";

// NOT: Anasayfa title/description'i KOK layout'taki generateMetadata (HOME_META)
// uretir. Burada KENDI metadata'mizi tanimlamiyoruz.

export default async function HomePage() {
  const isTr = (await resolveLang()) === "tr";
  const h1 = isTr
    ? "Canlı Skorlar, Puan Durumları ve Maç İstatistikleri"
    : "Live Scores, Standings and Match Statistics";
  return (
    <HomeProvider>
      {/* SEO: gorsel gizli ana baslik (robotlar gorur). */}
      <h1 className="sr-only">{h1}</h1>
      <HomeShell left={<LeftRail />} right={<RightRail />}>
        <HomeMain />
      </HomeShell>
      <ScrollToTop />
    </HomeProvider>
  );
}
