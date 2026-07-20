import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "Reklam",
    "Advertise",
    "Markanızı spora tutkulu, etkileşimi yüksek bir kitleyle buluşturun — Scores TV reklam çözümleri.",
    "Reach a highly engaged, sports-passionate audience with Scores TV advertising solutions.",
    "/reklam",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
