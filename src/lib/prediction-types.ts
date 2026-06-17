/** Backend PredictionResultView TS karşılığı — maç sonucu tahmin dağılımı. */
export type PredictionChoice = "HOME" | "DRAW" | "AWAY";

export interface PredictionResult {
  home: number;
  draw: number;
  away: number;
  total: number;
  /** Bu tarayıcının seçimi veya null. */
  myChoice: PredictionChoice | null;
  /** Oylama açık mı (kickoff'tan önce). */
  votingOpen: boolean;
}
