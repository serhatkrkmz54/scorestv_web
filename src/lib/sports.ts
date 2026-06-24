// Cok-spor (multi-sport) merkezi yapilandirma. Futbol davranisi/URL'leri
// DEGISMEDEN kalir; basketbol + voleybol eklenir. Tenis simdilik kapali.
import type { Lang } from "@/i18n/auth-strings";

export type Sport = "football" | "basketball" | "volleyball";

export interface SportConfig {
  id: Sport;
  /** HOME_STR icindeki etiket anahtari (futbol/basketbol/voleybol). */
  labelKey: "football" | "basketball" | "volleyball";
  /** Fikstur BFF taban yolu. Futbol /api/fixtures, digerleri /api/{sport}/fixtures. */
  fixturesApi: string;
  /** Mac detay BFF taban yolu (slug eklenir). */
  matchDetailApi: string;
  /** TR mac detay route segmenti (orn. "basketbol/mac"); futbol icin "mac". */
  trMatchSeg: string;
  /** EN mac detay route segmenti (orn. "basketball/match"); futbol icin "match". */
  enMatchSeg: string;
  /** Canli STOMP topic (lang eklenmez — sport topic'leri tek). Futbol farkli (lang'li). */
  liveTopic: string;
  /** Periyot/skor dagilim etiketleri (TR + EN). */
  periodLabels: { tr: string[]; en: string[] };
}

// Periyot etiketleri:
//   futbol     : IY / Uzt / Pen  (ScoreBreakdown'da kullanilir)
//   basketbol  : C1..C4 / UZT
//   voleybol   : S1..S5
export const SPORTS: Record<Sport, SportConfig> = {
  football: {
    id: "football",
    labelKey: "football",
    fixturesApi: "/api/fixtures",
    matchDetailApi: "/api/match-detail",
    trMatchSeg: "mac",
    enMatchSeg: "match",
    liveTopic: "/topic/fixtures/live",
    periodLabels: {
      tr: ["İY", "Uzt", "Pen"],
      en: ["HT", "ET", "Pen"],
    },
  },
  basketball: {
    id: "basketball",
    labelKey: "basketball",
    fixturesApi: "/api/basketball/fixtures",
    matchDetailApi: "/api/basketball/match-detail",
    trMatchSeg: "basketbol/mac",
    enMatchSeg: "basketball/match",
    liveTopic: "/topic/basketball/live",
    periodLabels: {
      tr: ["Ç1", "Ç2", "Ç3", "Ç4", "UZT"],
      en: ["Q1", "Q2", "Q3", "Q4", "OT"],
    },
  },
  volleyball: {
    id: "volleyball",
    labelKey: "volleyball",
    fixturesApi: "/api/volleyball/fixtures",
    matchDetailApi: "/api/volleyball/match-detail",
    trMatchSeg: "voleybol/mac",
    enMatchSeg: "volleyball/match",
    liveTopic: "/topic/volleyball/live",
    periodLabels: {
      tr: ["S1", "S2", "S3", "S4", "S5"],
      en: ["S1", "S2", "S3", "S4", "S5"],
    },
  },
};

export function sportConfig(sport: Sport): SportConfig {
  return SPORTS[sport];
}

/** Sıra: anasayfa sport tab'larinda gosterim sirasi. Tenis dahil degil (kapali). */
export const SPORT_ORDER: Sport[] = ["football", "basketball", "volleyball"];

export function periodLabel(sport: Sport, index: number, lang: Lang): string {
  const labels = SPORTS[sport].periodLabels[lang];
  return labels[index] ?? "";
}
