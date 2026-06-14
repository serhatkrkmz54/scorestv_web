// Backend Rankings DTO TS mirror.
// Endpoints:
//   GET /api/v1/rankings/fifa?confederation=&search=
//   GET /api/v1/rankings/uefa/clubs?season=&country=&search=
//   GET /api/v1/rankings/uefa/countries?season=&search=

export interface FifaRankingRow {
  rank: number | null;
  prevRank?: number | null;
  movement?: number | null;
  teamId: string;
  teamName: string;
  countryCode?: string | null;
  confederation?: string | null;
  confederationId?: string | null;
  totalPoints?: number | string | null;
  prevPoints?: number | string | null;
  ratedMatches?: number | null;
  flagUrl?: string | null;
}

export interface FifaRankingResponse {
  totalTeams: number;
  lastUpdated?: string | null;
  teams: FifaRankingRow[];
}

export interface UefaClubRow {
  rank: number | null;
  clubId: string;
  clubName: string;
  clubShortName?: string | null;
  clubOfficialName?: string | null;
  teamCode?: string | null;
  logoUrl?: string | null;
  bigLogoUrl?: string | null;
  mediumLogoUrl?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  totalPoints?: number | string | null;
  /** "UP" | "DOWN" | "STABLE" */
  trend?: string | null;
  numberOfMatches?: number | null;
  numberOfTeams?: number | null;
  baseSeasonYear?: number | null;
  seasonRankings?: Array<Record<string, unknown>>;
}

export interface UefaClubRankingResponse {
  totalClubs: number;
  targetSeasonYear?: number | null;
  lastUpdated?: string | null;
  clubs: UefaClubRow[];
}

export interface UefaCountryRow {
  rank: number | null;
  countryUefaId: string;
  countryName: string;
  countryCode?: string | null;
  logoUrl?: string | null;
  bigLogoUrl?: string | null;
  mediumLogoUrl?: string | null;
  totalPoints?: number | string | null;
  trend?: string | null;
  numberOfMatches?: number | null;
  numberOfTeams?: number | null;
  seasonRankings?: Array<Record<string, unknown>>;
}

export interface UefaCountryRankingResponse {
  totalCountries: number;
  targetSeasonYear?: number | null;
  lastUpdated?: string | null;
  countries: UefaCountryRow[];
}
