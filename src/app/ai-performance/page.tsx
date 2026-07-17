import type { Metadata } from "next";
import { getAiPerformance } from "@/lib/ai-performance-server";
import { AiPerformanceView } from "@/components/ai/AiPerformanceView";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "AI Prediction Accuracy | Scores TV",
  description:
    "Monthly and yearly accuracy of our AI analysis across match result, over/under 2.5, both teams to score and exact score. Statistical analysis.",
  alternates: {
    canonical: `${SITE}/ai-performance`,
    languages: { tr: `${SITE}/ai-performans`, en: `${SITE}/ai-performance` },
  },
};

export default async function Page() {
  const data = await getAiPerformance();
  return <AiPerformanceView data={data} lang="en" />;
}
