import type { Metadata } from "next";
import { resolveLang } from "@/lib/lang-server";
import { DownloadLanding } from "@/components/download/DownloadLanding";
import { redirectByDevice } from "@/components/download/download-gate";

export async function generateMetadata(): Promise<Metadata> {
  const tr = (await resolveLang()) === "tr";
  return {
    title: tr ? "Uygulamayı indir — Scores TV" : "Get the app — Scores TV",
    description: tr
      ? "Scores TV mobil uygulamasını App Store veya Google Play'den indir: canlı skorlar, bildirimler, diziliş ve AI Analiz."
      : "Download the Scores TV mobile app on the App Store or Google Play: live scores, notifications, lineups and AI Analysis.",
    alternates: { canonical: "/indir" },
  };
}

export default async function Page() {
  await redirectByDevice();
  return <DownloadLanding lang={await resolveLang()} />;
}
