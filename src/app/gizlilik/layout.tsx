import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "Gizlilik Politikası",
    "Privacy Policy",
    "Scores TV gizlilik politikası: hangi verileri topluyoruz, nasıl kullanıyoruz ve haklarınız.",
    "Scores TV privacy policy: what data we collect, how we use it and your rights.",
    "/gizlilik",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
