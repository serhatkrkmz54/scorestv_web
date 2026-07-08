import type { Metadata } from "next";
import {
  NewsListView,
  buildNewsListMetadata,
} from "@/components/news/NewsListView";
import { NewsCategoryRail } from "@/components/news/NewsCategoryRail";
import { NEWS_CATEGORIES } from "@/lib/news-format";
import type { NewsCategory } from "@/lib/news-types";

// Haber listesi — EN rota: /news. Dil sabit "en" (TR karşılığı /haberler).
interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

function isCategory(v: string | undefined): v is NewsCategory {
  return !!v && (NEWS_CATEGORIES as string[]).includes(v);
}

export function generateMetadata(): Metadata {
  return buildNewsListMetadata("en");
}

export default async function NewsListPageEn({ searchParams }: PageProps) {
  const sp = await searchParams;
  const active = isCategory(sp.category) ? sp.category : null;
  return (
    <div className="layout layout-2col">
      <aside className="rail-left">
        <NewsCategoryRail lang="en" active={active} />
      </aside>
      <main className="news-list-main">
        <NewsListView
          lang="en"
          categoryParam={sp.category}
          pageParam={sp.page}
        />
      </main>
    </div>
  );
}
