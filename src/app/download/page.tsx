import type { Metadata } from "next";
import { resolveLang } from "@/lib/lang-server";
import { DownloadLanding } from "@/components/download/DownloadLanding";
import { redirectByDevice } from "@/components/download/download-gate";

// /indir ile aynı akıllı indirme akışı — İngilizce URL alternatifi.
export async function generateMetadata(): Promise<Metadata> {
  const tr = (await resolveLang()) === "tr";
  return {
    title: tr ? "Uygulamayı indir — Scores TV" : "Get the app — Scores TV",
    description: tr
      ? "Scores TV mobil uygulamasını App Store veya Google Play'den indir."
      : "Download the Scores TV mobile app on the App Store or Google Play.",
    alternates: { canonical: "/download" },
  };
}

export default async function Page() {
  await redirectByDevice();
  return <DownloadLanding lang={await resolveLang()} />;
}
