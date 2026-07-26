import type { Metadata } from "next";
import { ReporterConsole } from "@/components/reporter/ReporterConsole";

// Saha Muhabiri konsolu — kişisel araç sayfası, indexlenmez.
export const metadata: Metadata = {
  title: "Saha Muhabiri | Scores TV",
  description:
    "Bölgendeki amatör ligi ScoresTV'ye taşı: fikstürü gir, canlı skoru tut, Scores Puanı kazan.",
  robots: { index: false, follow: false },
};

export default function MuhabirPage() {
  return <ReporterConsole />;
}
