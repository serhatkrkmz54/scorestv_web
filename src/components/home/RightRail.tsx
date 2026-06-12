"use client";

import { FeaturedMatch } from "./FeaturedMatch";
import { TwitterFeed } from "./TwitterFeed";
import { NewsList } from "./NewsList";

export function RightRail() {
  return (
    <>
      <FeaturedMatch />
      <TwitterFeed />
      <NewsList />
    </>
  );
}
