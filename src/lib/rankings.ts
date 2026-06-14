import "server-only";
import { backendJson } from "./backend";
import type {
  FifaRankingResponse,
  UefaClubRankingResponse,
  UefaCountryRankingResponse,
} from "./rankings-types";

export async function fetchFifaRankingServer(lang: "tr" | "en" = "tr"): Promise<FifaRankingResponse | null> {
  const r = await backendJson<FifaRankingResponse>(`/api/v1/rankings/fifa?lang=${lang}`);
  return r.ok && r.body ? r.body : null;
}
export async function fetchUefaClubRankingServer(lang: "tr" | "en" = "tr"): Promise<UefaClubRankingResponse | null> {
  const r = await backendJson<UefaClubRankingResponse>(`/api/v1/rankings/uefa/clubs?lang=${lang}`);
  return r.ok && r.body ? r.body : null;
}
export async function fetchUefaCountryRankingServer(lang: "tr" | "en" = "tr"): Promise<UefaCountryRankingResponse | null> {
  const r = await backendJson<UefaCountryRankingResponse>(`/api/v1/rankings/uefa/countries?lang=${lang}`);
  return r.ok && r.body ? r.body : null;
}
