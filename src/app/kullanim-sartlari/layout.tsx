import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "Kullanım Şartları",
    "Terms of Use",
    "Scores TV kullanım şartları: hizmetin kullanımı, sorumluluklar ve veri doğruluğu.",
    "Scores TV terms of use: service usage, responsibilities and data accuracy.",
    "/kullanim-sartlari",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
