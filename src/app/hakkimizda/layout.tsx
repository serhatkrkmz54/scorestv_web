import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "Hakkımızda",
    "About Us",
    "ScoresTV hakkında: misyonumuz, sunduğumuz canlı skor, istatistik ve takım/oyuncu bilgileri.",
    "About ScoresTV: our mission and the live scores, stats and team/player info we offer.",
    "/hakkimizda",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
