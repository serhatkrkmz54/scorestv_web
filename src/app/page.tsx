import { HomeProvider } from "@/context/home-context";
import { HomeMain } from "@/components/home/HomeMain";
import { HomeShell } from "@/components/home/HomeShell";
import { LeftRail } from "@/components/home/LeftRail";
import { RightRail } from "@/components/home/RightRail";
import { ScrollToTop } from "@/components/home/ScrollToTop";
import { SetSportFootball } from "@/components/home/SetSportFootball";
import { AiTrustStrip } from "@/components/ai/AiTrustStrip";
import { resolveLang } from "@/lib/lang-server";
import { getLatestNews } from "@/lib/news-server";
import { fetchHomeServer } from "@/lib/home-server";
import { getAiPerformance } from "@/lib/ai-performance-server";

// NOT: Anasayfa title/description'i KOK layout'taki generateMetadata (HOME_META)
// uretir. Burada KENDI metadata'mizi tanimlamiyoruz.

export default async function HomePage() {
  const lang = await resolveLang();
  const isTr = lang === "tr";
  // Sag ray haberleri + anasayfa fikstürleri PARALEL SSR — Google'ın ilk
  // aldigi HTML'de canli maclar/skorlar yer alsin (yalniz "Yukleniyor..." degil).
  const [news, home, ai] = await Promise.all([
    getLatestNews(lang, 5),
    fetchHomeServer(lang),
    getAiPerformance(),
  ]);
  const h1 = isTr
    ? "Canlı Skorlar, Puan Durumları ve Maç İstatistikleri"
    : "Live Scores, Standings and Match Statistics";
  return (
    <HomeProvider
      initialDates={home.dates}
      initialDay={home.day}
      initialDate={home.date}
    >
      {/* "/" her zaman FUTBOL — spor-context'i sabitle (regression koruma). */}
      <SetSportFootball />
      {/* SEO: gorsel gizli ana baslik (robotlar gorur). */}
      <h1 className="sr-only">{h1}</h1>
      {/* Şerit layout GRID'inin DIŞINDA (grid'e 4. eleman girmesin → 3 sütun bozulmaz). */}
      <AiTrustStrip lang={lang} initial={ai} />
      <HomeShell left={<LeftRail />} right={<RightRail news={news} />}>
        <HomeMain />
      </HomeShell>
      <ScrollToTop />
    </HomeProvider>
  );
}
