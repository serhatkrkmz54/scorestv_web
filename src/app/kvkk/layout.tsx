import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "KVKK Aydınlatma Metni",
    "Data Protection (GDPR / KVKK)",
    "KVKK aydınlatma metni: kişisel verilerinizin işlenmesi, amaçları ve haklarınız.",
    "Data protection notice (GDPR/KVKK): how your personal data is processed and your rights.",
    "/kvkk",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
