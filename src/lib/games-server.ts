import "server-only";
import { backendJson } from "@/lib/backend";

// Scores Coin — global liderlik tablosu. Backend: GET /api/v1/game/leaderboard
// (public; GameDtos.LeaderboardEntry ile birebir).
export interface GameLeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  coins: number;
  correct: number;
  total: number;
}

/** İlk N oyuncu. Backend kapalı/boşsa sessizce [] döner (sayfa yine açılır). */
export async function fetchGameLeaderboardServer(
  limit = 10,
): Promise<GameLeaderboardEntry[]> {
  const r = await backendJson<GameLeaderboardEntry[]>(
    `/api/v1/game/leaderboard?limit=${limit}`,
  );
  return r.ok && Array.isArray(r.body) ? r.body : [];
}
