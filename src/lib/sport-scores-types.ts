// Basketbol + voleybol FIKSTUR LISTE modeli. Futbol FixtureSummary'den ayri
// tutulur (kendi skor sekli var). BFF, backend game item'ini bu sport-etiketli
// ortak modele cevirir. Anasayfa MatchRow bu modeli render eder.
import type { Sport } from "./sports";

// ====== Ortak parcalar ======

export interface SportTeam {
  id: number;
  name: string;
  logo: string | null;
}

export interface SportLeagueInfo {
  id: number;
  name: string;
  logo: string | null;
  country: string | null;
  countryFlag: string | null;
}

export interface SportGameStatus {
  /** Kisa kod: NS / Q1..Q4 / OT / S1..S5 / FT / AOT / AW ... */
  shortCode: string | null;
  longName: string | null;
  /** Sadece basketbolda dolu olur (oyun saati / kalan). */
  timer?: string | null;
}

// ====== Basketbol skoru ======

export interface BasketballQuarters {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  ot: number | null;
}

export interface BasketballScore {
  homeTotal: number | null;
  awayTotal: number | null;
  home: BasketballQuarters;
  away: BasketballQuarters;
}

// ====== Voleybol skoru ======

export interface VolleyballSets {
  set1: number | null;
  set2: number | null;
  set3: number | null;
  set4: number | null;
  set5: number | null;
}

export interface VolleyballScore {
  /** Kazanilan set sayisi. */
  homeTotal: number | null;
  awayTotal: number | null;
  /** Her set icin sayilar. */
  home: VolleyballSets;
  away: VolleyballSets;
}

// ====== Sport-etiketli mac ozeti (discriminated union) ======

interface SportGameBase {
  id: number;
  /** Detay sayfasi icin SEO slug ("home-vs-away-{id}"). BFF uretir. */
  slug: string;
  startAt: string; // ISO Instant
  season: string | null;
  status: SportGameStatus;
  league: SportLeagueInfo;
  home: SportTeam;
  away: SportTeam;
}

export interface BasketballGameSummary extends SportGameBase {
  sport: "basketball";
  score: BasketballScore;
}

export interface VolleyballGameSummary extends SportGameBase {
  sport: "volleyball";
  score: VolleyballScore;
}

export type SportGameSummary = BasketballGameSummary | VolleyballGameSummary;

// ====== Lig grubu + gun yaniti (BFF cikti formati) ======

export interface SportLeagueGroup {
  league: SportLeagueInfo;
  games: SportGameSummary[];
}

export interface SportDayResponse {
  sport: Sport;
  date: string | null;
  gameCount: number;
  liveCount: number;
  leagues: SportLeagueGroup[];
}

// ====== Backend liste item ham tipleri (BFF parse icin) ======

export interface RawBasketballGame {
  id: number;
  startAt: string;
  season: string | null;
  status: { shortCode: string | null; longName: string | null; timer: string | null };
  league: { id: number; name: string; logo: string | null; country: string | null; countryFlag: string | null };
  home: { id: number; name: string; logo: string | null };
  away: { id: number; name: string; logo: string | null };
  score: {
    homeTotal: number | null;
    awayTotal: number | null;
    home: BasketballQuarters;
    away: BasketballQuarters;
  };
}

export interface RawVolleyballGame {
  id: number;
  startAt: string;
  season: string | null;
  status: { shortCode: string | null; longName: string | null };
  league: { id: number; name: string; logo: string | null; country: string | null; countryFlag: string | null };
  home: { id: number; name: string; logo: string | null };
  away: { id: number; name: string; logo: string | null };
  score: {
    homeTotal: number | null;
    awayTotal: number | null;
    home: VolleyballSets;
    away: VolleyballSets;
  };
}
