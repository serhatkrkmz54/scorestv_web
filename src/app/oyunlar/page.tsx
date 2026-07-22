import type { Metadata } from "next";
import { resolveLang } from "@/lib/lang-server";
import { fetchGameLeaderboardServer } from "@/lib/games-server";
import { GamesLanding } from "@/components/games/GamesLanding";

export async function generateMetadata(): Promise<Metadata> {
  const tr = (await resolveLang()) === "tr";
  return {
    title: tr ? "Oyunlar — Bil Kazan & Scores Coin | Scores TV" : "Games — Predict & Win with Scores Coin | Scores TV",
    description: tr
      ? "Scores TV oyunları: Bil Kazan düellolarında tahmin yap, Scores Coin topla, liderlik tablosunda yüksel. Kadronu Kur ve Haftanın Oyuncusu çok yakında!"
      : "Scores TV games: make predictions in Predict & Win duels, collect Scores Coin and climb the leaderboard. Build Your XI and Player of the Week coming soon!",
    alternates: {
      canonical: "/oyunlar",
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
