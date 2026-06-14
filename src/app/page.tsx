import { HomeProvider } from "@/context/home-context";
import { HomeFixtures } from "@/components/home/HomeFixtures";
import { LeftRail } from "@/components/home/LeftRail";
import { RightRail } from "@/components/home/RightRail";
import { ScrollToTop } from "@/components/home/ScrollToTop";

export default function HomePage() {
  return (
    <HomeProvider>
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <HomeFixtures />
        <aside className="rail-right">
          <RightRail />
        </aside>
      </div>
      <ScrollToTop />
    </HomeProvider>
  );
}
