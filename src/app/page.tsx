import { HomeProvider } from "@/context/home-context";
import { HomeFixtures } from "@/components/home/HomeFixtures";
import { LeftRail } from "@/components/home/LeftRail";
import { RightRail } from "@/components/home/RightRail";
import { ScrollToTop } from "@/components/home/ScrollToTop";
import { resolveLang } from "@/lib/lang-server";

// NOT: Anasayfa title/description'i KOK layout'taki generateMetadata (HOME_META)
// uretir. Burada KENDI metadata'mizi tanimlamiyoruz — aksi halde layout'taki
// dogru basligi ezer ve ilk yuklemede eski "ScoresTV — ..." basligi kalirdi.

export default async function HomePage() {
  const isTr = (await resolveLang()) === "tr";
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
