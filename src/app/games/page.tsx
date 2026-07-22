import type { Metadata } from "next";
import { resolveLang } from "@/lib/lang-server";
import { fetchGameLeaderboardServer } from "@/lib/games-server";
import { GamesLanding } from "@/components/games/GamesLanding";

// /oyunlar ile aynı içerik — İngilizce URL alternatifi.
export async function generateMetadata(): Promise<Metadata> {
  const tr = (await resolveLang()) === "tr";
  return {
    title: tr ? "Oyunlar — Bil Kazan & Scores Puanı | Scores TV" : "Games — Predict & Win with Scores Points | Scores TV",
    description: tr
      ? "Scores TV oyunları: Bil Kazan düellolarında tahmin yap, Scores Puanı topla, liderlik tablosunda yüksel."
      : "Scores TV games: make predictions in Predict & Win duels, collect Scores Points and climb the leaderboard.",
    alternates: {
      canonical: "/games",
      languages: { tr: "/oyunlar", en: "/games" },
    },
  };
}

export default async function Page() {
  const [lang, leaderboard] = await Promise.all([
    resolveLang(),
    fetchGameLeaderboardServer(10),
  ]);
  return <GamesLanding lang={lang} leaderboard={leaderboard} />;
}
