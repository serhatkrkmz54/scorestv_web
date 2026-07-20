import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "Hakkımızda",
    "About Us",
    "Scores TV hakkında: misyonumuz, sunduğumuz canlı skor, istatistik ve takım/oyuncu bilgileri.",
    "About Scores TV: our mission and the live scores, stats and team/player info we offer.",
    "/hakkimizda",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
