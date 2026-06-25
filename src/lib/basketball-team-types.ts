// Backend BasketballTeamDetailResponse TS karsiligi (birebir alan adlari).
// Endpoint: GET /api/v1/basketball/teams/{slug}?season=&lang=tr|en
// Slug format: "{takim-adi}-{teamId}" (orn. "fenerbahce-145").

export interface BkTeamHero {
  id: number;
  name: string;
  displayName: string | null;
  logo: string | null;
  code: string | null;
  founded: number | null;
  national: boolean | null;
  countryName: string | null;
  countryCode: string | null;
  countryFlag: string | null;
  venueName: string | null;
  venueCity: string | null;
  venueCapacity: number | null;
  slug: string | null;
}

export interface BkTeamLeagueRef {
  id: number;
  name: string;
  displayName: string | null;
  logo: string | null;
  slug: string | null;
  type: string | null;
}

export interface BkTeamRefDetail {
  id: number;
  name: string;
  displayName: string | null;
  logo: string | null;
  slug: string | null;
}

export interface BkFixtureItem {
  id: number;
  slug: string | null;
  startAt: string | null; // ISO Instant
  statusShort: string | null;
  statusLong: string | null;
  statusText: string | null;
  stage: string | null;
  week: string | null;
  home: BkTeamRefDetail;
  away: BkTeamRefDetail;
  homeScore: number | null;
  awayScore: number | null;
}

export interface BkSeasonSummary {
  wins: number | null;
  loses: number | null;
  winPercentage: number | string | null;
  pointsForAvg: number | string | null;
  pointsAgainstAvg: number | string | null;
}

export interface BkOverviewBlock {
  lastGame: BkFixtureItem | null;
  nextGame: BkFixtureItem | null;
  seasonSummary: BkSeasonSummary | null;
}

export interface BkRosterPlayer {
  id: number;
  name: string;
  displayName: string | null;
  photo: string | null;
  position: string | null;
  jerseyNumber: number | null;
  heightCm: number | null;
  weightKg: number | null;
  nationality: string | null;
  slug: string | null;
}

export interface BkHomeAwayBlock {
  played: number | null;
  wins: number | null;
  loses: number | null;
  winPercentage: number | string | null;
  pointsForAvg: number | string | null;
  pointsAgainstAvg: number | string | null;
}

export interface BkStatisticsBlock {
  gamesPlayed: number | null;
  wins: number | null;
  loses: number | null;
  winPercentage: number | string | null;
  pointsForTotal: number | null;
  pointsForAvg: number | string | null;
  pointsAgainstTotal: number | null;
  pointsAgainstAvg: number | string | null;
  pointsDiffAvg: number | string | null;
  longestWinStreak: number | null;
  longestLoseStreak: number | null;
  form: string | null;
  homeBreakdown: BkHomeAwayBlock | null;
  awayBreakdown: BkHomeAwayBlock | null;
}

export interface BkStandingPosition {
  position: number | null;
  groupName: string | null;
  gamesPlayed: number | null;
  wins: number | null;
  loses: number | null;
  winPercentage: number | string | null;
  description: string | null;
}

export interface BasketballTeamDetailResponse {
  hero: BkTeamHero;
  leagueRef: BkTeamLeagueRef | null;
  selectedSeason: string | null;
  availableSeasons: string[];
  overview: BkOverviewBlock | null;
  roster: BkRosterPlayer[];
  recentGames: BkFixtureItem[];
  upcomingGames: BkFixtureItem[];
  statistics: BkStatisticsBlock | null;
  standingsPosition: BkStandingPosition | null;
  lastSyncedAt: string | null;
}
