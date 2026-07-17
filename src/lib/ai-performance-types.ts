// AI Analiz isabet karnesi tipleri — backend AiPerformanceView ile birebir.

export interface AiStatBlock {
  total: number; // notlanmış maç
  resultTotal: number; // favori verilen (başabaş olmayan) maç
  resultHits: number;
  resultPct: number; // maç sonucu (1X2)
  ouHits: number;
  ouPct: number; // alt/üst 2.5
  bttsHits: number;
  bttsPct: number; // karşılıklı gol
  exactHits: number;
  exactPct: number; // tam skor
  overallPct: number; // birleşik (1X2 + AÜ + KG)
}

export interface AiMonthBlock {
  ym: string; // "2026-07"
  total: number;
  overallPct: number;
  resultPct: number;
  ouPct: number;
  bttsPct: number;
  exactPct: number;
}

export interface AiPerformance {
  month: AiStatBlock; // son 30 gün
  year: AiStatBlock; // son 365 gün
  all: AiStatBlock; // tüm zaman
  months: AiMonthBlock[]; // son 12 ay kırılımı
}

/** Anlamlı gösterim için asgari örneklem (altındaysa rozet/sayfa gizlenebilir). */
export const AI_MIN_SAMPLE = 30;
