import type { Metadata } from "next";
import {
  buildNewsMetadata,
  NewsDetailPage,
} from "@/components/news/NewsDetailPage";

// Haber detay — EN rota: /news/<slug>. Dil sabit "en".
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildNewsMetadata(slug, "en");
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <NewsDetailPage slug={slug} lang="en" />;
}
