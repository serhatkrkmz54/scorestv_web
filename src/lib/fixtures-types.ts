// Backend PublicFixtureController DTO'larıyla birebir eşleşen tipler.

export interface LeagueInfo {
  id: number;
  name: string;
  type: string; // "Lig" | "Kupa" (dile göre)
  logo: string | null;
  country: string | null;
  countryFlag: string | null;
  covered: boolean;
  slug?: string | null; // dile göre lig slug'ı (backend redeploy sonrası)
}

export interface LeagueRef {
  id: number;
  name: string;
  type: string;
  logo: string | null;
  slug: string | null;
}

export interface FixtureStatus {
  shortCode: string | null; // NS, 1H, HT, 2H, FT, ...
  longText: string | null;
  elapsed: number | null; // sadece canlıyken dolu
  extra: number | null;
}

export interface FixtureTeam {
  id: number;
  name: string;
  logo: string | null;
  slug: string | null;
}

export interface ScorePeriod {
  home: number | null;
  away: number | null;
}

export interface FixtureScore {
  home: number | null;
  away: number | null;
  halftime: ScorePeriod | null;
  extraTime: ScorePeriod | null;
  penalty: ScorePeriod | null;
}

export interface FixtureVenue {
  name: string | null;
  city: string | null;
}

export interface FixtureSummary {
  id: number;
  slug: string;
  leagueRef: LeagueRef;
  round: string | null;
  kickoff: string; // ISO Instant
  lastSyncedAt: string | null;
  status: FixtureStatus;
  homeTeam: FixtureTeam;
  awayTeam: FixtureTeam;
  score: FixtureScore;
  venue: FixtureVenue | null;
  // Bu maçta ev/deplasman takımının gördüğü kırmızı kart sayısı (0+).
  // Eski cache'lerden null gelebilir; UI 0 sayar.
  homeRedCards: number | null;
  awayRedCards: number | null;
}

export interface LeagueGroup {
  league: LeagueInfo;
  fixtures: FixtureSummary[];
}

export interface FixtureDayResponse {
  date: string;
  fixtureCount: number;
  liveCount: number;
  leagues: LeagueGroup[];
}

export interface DateEntry {
  date: string; // yyyy-MM-dd
  dayName: string;
  fixtureCount: number;
  liveCount: number;
}

export interface FixtureDatesResponse {
  today: string;
  dates: DateEntry[];
}

export type StatusCategory = "live" | "upcoming" | "finished";
export type StatusFilter = "all" | "fav" | StatusCategory;

export interface PopularLeague {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  country: string | null;
  countryFlag: string | null;
}

export interface PopularCountry {
  id: number;
  name: string;
  slug: string;
  flag: string | null;
  code: string | null;
}

export interface PopularTeam {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  country: string | null;
}
