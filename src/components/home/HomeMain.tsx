"use client";

import { useSport } from "@/context/sport-context";
import { HomeFixtures } from "./HomeFixtures";
import { SportFixtures } from "./SportFixtures";

// Secili spora gore anasayfa ana kolonunu degistirir.
// Futbol → HomeFixtures (DEGISMEDEN, HomeProvider'a bagli, canli WS'li).
// Basketbol/voleybol → SportFixtures (kendi veri akisi).
export function HomeMain() {
  const { sport } = useSport();
  if (sport === "football") return <HomeFixtures />;
  return <SportFixtures sport={sport} />;
}
