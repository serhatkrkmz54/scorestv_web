import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "İletişim",
    "Contact",
    "Soru, görüş, öneri ve iş birliği talepleriniz için ScoresTV iletişim formu.",
    "Reach ScoresTV for questions, feedback, suggestions and partnership requests.",
    "/iletisim",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
