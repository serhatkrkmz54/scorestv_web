import "server-only";
import { backendJson } from "./backend";

// "Canlı Maç Programı / Hangi Kanalda" hub'i — backend
// GET /api/v1/football/tv-guide?date=&country=TR&lang= yaniti.
// Alan adlari backend TvGuideResponse ile birebir aynidir.

export interface TvGuideMatch {
  slug: string;
  /** ISO Instant.toString() — orn "2026-07-05T18:00:00Z". */
  kickoff: string | null;
  /** API durum kodu ("NS", "1H", "FT" ...). */
  status: string | null;
  /** Durum uzun metni (dile gore). */
  statusText: string | null;
  homeName: string;
  homeSlug: string;
  homeLogo: string | null;
  homeScore: number | null;
  awayName: string;
  awaySlug: string;
  awayLogo: string | null;
  awayScore: number | null;
}

export interface TvGuideLeague {
  name: string;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  /** Varsayilan kanal adlari (ilk 3, tekrarsiz); bos olabilir. */
  channels: string[];
  matches: TvGuideMatch[];
}

export interface TvGuideResponse {
  /** Sorgulanan tarih (ISO, yyyy-MM-dd). */
  date: string;
  /** Kanali olan ligler ustte. */
  leagues: TvGuideLeague[];
}

/**
 * Bir gunun futbol TV programini backend'den ceker (SSR, cache yok).
 * Ust katman (page) BACKEND_URL'i env'den okuyan backendJson uzerinden gider.
 */
export async function fetchTvGuideServer(
  date: string,
  lang: "tr" | "en",
): Promise<TvGuideResponse | null> {
  const r = await backendJson<TvGuideResponse>(
    `/api/v1/football/tv-guide?date=${encodeURIComponent(date)}&lang=${lang}&country=TR`,
  );
  return r.ok && r.body ? r.body : null;
}
