// Basketbol + voleybol mac durumu / skor yardimcilari (client + server guvenli).
// Futbol fixtures.ts esi — ayri tutulur cunku status kodlari farkli.
import type { Lang } from "@/i18n/auth-strings";
import type {
  SportGameStatus,
  SportGameSummary,
} from "./sport-scores-types";
import type { Sport } from "./sports";

export type SportStatusCategory = "live" | "upcoming" | "finished";

// Basketbol: canli {Q1,Q2,Q3,Q4,OT,BT,HT}, bitti {FT,AOT}. NS=bas/yok.
const BASKET_LIVE = new Set(["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT", "LIVE"]);
const BASKET_FINISHED = new Set(["FT", "AOT"]);
// Voleybol: canli {S1,S2,S3,S4,S5}, bitti {FT,AW}. NS=basmadi.
const VOLLEY_LIVE = new Set(["S1", "S2", "S3", "S4", "S5", "LIVE"]);
const VOLLEY_FINISHED = new Set(["FT", "AW"]);

export function categorizeSport(
  sport: Sport,
  status: SportGameStatus,
): SportStatusCategory {
  const code = status.shortCode ?? "";
  if (sport === "basketball") {
    if (BASKET_LIVE.has(code)) return "live";
    if (BASKET_FINISHED.has(code)) return "finished";
    return "upcoming";
  }
  // voleybol (ve fallback)
  if (VOLLEY_LIVE.has(code)) return "live";
  if (VOLLEY_FINISHED.has(code)) return "finished";
  return "upcoming";
}

// Kisa status etiketleri — dar satira sigsin diye.
const BASKET_SHORT: Record<string, { tr: string; en: string }> = {
  Q1: { tr: "1. Ç", en: "Q1" },
  Q2: { tr: "2. Ç", en: "Q2" },
  Q3: { tr: "3. Ç", en: "Q3" },
  Q4: { tr: "4. Ç", en: "Q4" },
  OT: { tr: "UZT", en: "OT" },
  HT: { tr: "Devre", en: "HT" },
  BT: { tr: "Ara", en: "BT" },
  FT: { tr: "Bitti", en: "FT" },
  AOT: { tr: "Uzatma", en: "AOT" },
  POST: { tr: "Ertelendi", en: "Postp" },
  CANC: { tr: "İptal", en: "Canc" },
  NS: { tr: "—", en: "—" },
};

const VOLLEY_SHORT: Record<string, { tr: string; en: string }> = {
  S1: { tr: "1. Set", en: "S1" },
  S2: { tr: "2. Set", en: "S2" },
  S3: { tr: "3. Set", en: "S3" },
  S4: { tr: "4. Set", en: "S4" },
  S5: { tr: "5. Set", en: "S5" },
  FT: { tr: "Bitti", en: "FT" },
  AW: { tr: "Hükmen", en: "AW" },
  POST: { tr: "Ertelendi", en: "Postp" },
  CANC: { tr: "İptal", en: "Canc" },
  NS: { tr: "—", en: "—" },
};

export function sportStatusLabelShort(
  sport: Sport,
  status: SportGameStatus,
  lang: Lang,
): string {
  const code = status.shortCode ?? "";
  const map = sport === "basketball" ? BASKET_SHORT : VOLLEY_SHORT;
  const m = map[code];
  if (m) return m[lang];
  // basketbolda canli timer varsa onu goster
  if (sport === "basketball" && status.timer) return status.timer;
  return code || (lang === "tr" ? "Bitti" : "FT");
}

/** Yaklasan macin baslama saati (yerel, HH:mm). */
export function startTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** Kazanan taraf — basketbolda total, voleybolda kazanilan set. Beraberlik yok. */
export function sportWinnerSide(
  game: SportGameSummary,
): "home" | "away" | null {
  const h = game.score.homeTotal;
  const a = game.score.awayTotal;
  if (h == null || a == null) return null;
  if (h > a) return "home";
  if (a > h) return "away";
  return null;
}
