import type { Metadata } from "next";
import { fetchFifaRankingServer, fetchUefaClubRankingServer, fetchUefaCountryRankingServer } from "@/lib/rankings";
import { RankingsScreen } from "@/components/rankings/RankingsScreen";
import { LeftRail } from "@/components/home/LeftRail";

export const metadata: Metadata = {
  title: "Sıralamalar — FIFA & UEFA | Scores TV",
  description:
    "FIFA Erkek Milli Takım Sıralaması, UEFA Kulüp Katsayısı ve UEFA Ülke Katsayısı — güncel sıralamalar.",
};

export default async function Page() {
  const [fifa, clubs, countries] = await Promise.all([
    fetchFifaRankingServer("tr"),
    fetchUefaClubRankingServer("tr"),
    fetchUefaCountryRankingServer("tr"),
  ]);
  return (
    <div className="layout">
      <aside className="rail-left">
        <LeftRail />
      </aside>
      <main className="rankings-main">
        <RankingsScreen initialFifa={fifa} initialClubs={clubs} initialCountries={countries} lang="tr" />
      </main>
      <aside className="rail-right" />
    </div>
  );
}
