"use client";

import type {
  FifaRankingResponse,
  UefaClubRankingResponse,
  UefaCountryRankingResponse,
} from "./rankings-types";

export async function fetchFifaRankingClient(): Promise<FifaRankingResponse> {
  const r = await fetch("/api/rankings/fifa", { cache: "no-store" });
  if (!r.ok) throw new Error(`FIFA ranking alinamadi (${r.status})`);
  return (await r.json()) as FifaRankingResponse;
}
export async function fetchUefaClubRankingClient(): Promise<UefaClubRankingResponse> {
  const r = await fetch("/api/rankings/uefa-clubs", { cache: "no-store" });
  if (!r.ok) throw new Error(`UEFA Clubs ranking alinamadi (${r.status})`);
  return (await r.json()) as UefaClubRankingResponse;
}
export async function fetchUefaCountryRankingClient(): Promise<UefaCountryRankingResponse> {
  const r = await fetch("/api/rankings/uefa-countries", { cache: "no-store" });
  if (!r.ok) throw new Error(`UEFA Countries ranking alinamadi (${r.status})`);
  return (await r.json()) as UefaCountryRankingResponse;
}
