import type { ReactNode } from "react";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/static-metadata";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata(
    "Kariyer",
    "Careers",
    "Spora ve teknolojiye tutkulu bir ekibin parçası olun — ScoresTV kariyer fırsatları.",
    "Join a team passionate about sports and technology — careers at ScoresTV.",
    "/kariyer",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
