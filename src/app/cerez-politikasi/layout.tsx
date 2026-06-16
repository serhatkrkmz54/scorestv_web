import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "Çerez Politikası",
    "Cookie Policy",
    "ScoresTV çerez politikası: hangi çerezleri kullanıyoruz ve nasıl yönetebilirsiniz.",
    "ScoresTV cookie policy: which cookies we use and how you can manage them.",
    "/cerez-politikasi",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
