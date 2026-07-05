"use client";

import { FeaturedMatch } from "./FeaturedMatch";
import { TwitterFeed } from "./TwitterFeed";
import { NewsList } from "./NewsList";
import type { NewsListItem } from "@/lib/news-types";

export function RightRail({ news = [] }: { news?: NewsListItem[] }) {
  return (
    <>
      <FeaturedMatch />
      <TwitterFeed />
      <NewsList items={news} />
    </>
  );
}
