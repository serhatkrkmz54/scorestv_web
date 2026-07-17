import type { Metadata } from "next";
import { getAiPerformance } from "@/lib/ai-performance-server";
import { AiPerformanceView } from "@/components/ai/AiPerformanceView";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "AI Tahmin İsabet Karnesi | Scores TV",
  description:
    "AI analizlerimizin maç sonucu, alt/üst 2.5, karşılıklı gol ve tam skor tahminlerindeki aylık ve yıllık isabet oranları. İstatistiksel analizdir.",
  alternates: {
    canonical: `${SITE}/ai-performans`,
    languages: { tr: `${SITE}/ai-performans`, en: `${SITE}/ai-performance` },
  },
};

export default async function Page() {
  const data = await getAiPerformance();
  return <AiPerformanceView data={data} lang="tr" />;
}
