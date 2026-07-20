import type { Metadata } from "next";
import { fetchFifaRankingServer, fetchUefaClubRankingServer, fetchUefaCountryRankingServer } from "@/lib/rankings";
import { RankingsScreen } from "@/components/rankings/RankingsScreen";
import { LeftRail } from "@/components/home/LeftRail";

export const metadata: Metadata = {
  title: "Rankings — FIFA & UEFA | Scores TV",
  description:
    "FIFA Men's National Team Ranking, UEFA Club Coefficient and UEFA Country Coefficient — current rankings.",
};

export default async function Page() {
  const [fifa, clubs, countries] = await Promise.all([
    fetchFifaRankingServer("en"),
    fetchUefaClubRankingServer("en"),
    fetchUefaCountryRankingServer("en"),
  ]);
  return (
    <div className="layout">
      <aside className="rail-left">
        <LeftRail />
      </aside>
      <main className="rankings-main">
        <RankingsScreen initialFifa={fifa} initialClubs={clubs} initialCountries={countries} lang="en" />
      </main>
      <aside className="rail-right" />
    </div>
  );
}
