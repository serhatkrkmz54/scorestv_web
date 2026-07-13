/** "AI Analiz" yanıtı — backend `MatchInsightResponse` karşılığı.
 *  İstatistiksel analiz, bahis tavsiyesi değil. */
export interface MatchInsight {
  available: boolean;
  homeWinPct?: number | null;
  drawPct?: number | null;
  awayWinPct?: number | null;
  over25Pct?: number | null;
  under25Pct?: number | null;
  bttsYesPct?: number | null;
  bttsNoPct?: number | null;
  expectedGoalsHome?: number | null;
  expectedGoalsAway?: number | null;
  /** Yaklaşık beklenen skor, örn. "2-1". */
  expectedScore?: string | null;
  /** "HOME" | "DRAW" | "AWAY" | null (başa baş). */
  favorite?: string | null;
  /** Yerelleştirilmiş güven: Yüksek/Orta/Düşük. */
  confidence?: string | null;
  summary?: string | null;
  note?: string | null;
}
