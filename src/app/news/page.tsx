import type { Metadata } from "next";
import {
  NewsListView,
  buildNewsListMetadata,
} from "@/components/news/NewsListView";

// Haber listesi — EN rota: /news. Dil sabit "en" (TR karşılığı /haberler).
interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export function generateMetadata(): Metadata {
  return buildNewsListMetadata("en");
}

export default async function NewsListPageEn({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <NewsListView lang="en" categoryParam={sp.category} pageParam={sp.page} />
  );
}
