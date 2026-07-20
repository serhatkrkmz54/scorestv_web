import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Profilim | Scores TV",
  description: "Hesap bilgilerini görüntüle ve düzenle.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProfilePage />;
}
