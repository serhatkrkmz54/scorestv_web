import type { Metadata } from "next";
import {
  NewsListView,
  buildNewsListMetadata,
} from "@/components/news/NewsListView";
import { NewsCategoryRail } from "@/components/news/NewsCategoryRail";
import { NEWS_CATEGORIES } from "@/lib/news-format";
import type { NewsCategory } from "@/lib/news-types";

// Haber listesi — TR rota: /haberler. Dil sabit "tr" (EN karşılığı /news).
interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

function isCategory(v: string | undefined): v is NewsCategory {
  return !!v && (NEWS_CATEGORIES as string[]).includes(v);
}

export function generateMetadata(): Metadata {
  return buildNewsListMetadata("tr");
}

export default async function NewsListPageTr({ searchParams }: PageProps) {
  const sp = await searchParams;
  const active = isCategory(sp.category) ? sp.category : null;
  return (
    <div className="layout layout-2col">
      <aside className="rail-left">
        <NewsCategoryRail lang="tr" active={active} />
      </aside>
      <div className="news-list-main">
        <NewsListView
          lang="tr"
          categoryParam={sp.category}
          pageParam={sp.page}
        />
      </div>
    </div>
  );
}
