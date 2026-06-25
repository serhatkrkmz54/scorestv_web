// Backend basketbol lig DTO'larinin TS karsiligi (birebir alan adlari).
// Kaynak DTO'lar:
//   BasketballLeagueHubResponse        GET /api/v1/basketball/leagues/hub
//   BasketballLeagueDetailResponse     GET /api/v1/basketball/leagues/{slug}/detail
//   BasketballStandingsPageResponse    GET /api/v1/basketball/leagues/{slug}/standings
//   BasketballLeagueTeamView           GET /api/v1/basketball/leagues/{id}/teams

// ===== Hub (ulke gruplu lig listesi) =====

export interface BkLeagueRef {
  id: number;
  name: string;
  logo: string | null;
  type: string | null;
  currentSeason: string | null;
}

export interface BkHubCountryGroup {
  name: string;
  code: string | null;
  flag: string | null;
  leagues: BkLeagueRef[];
}

export interface BasketballLeagueHubResponse {
  totalLeagues: number;
  countries: BkHubCountryGroup[];
}

// ===== Lig detay =====

export interface BkLeagueCountry {
  name: string | null;
  code: string | null;
  flag: string | null;
}

export interface BkCoverageInfo {
  statsTeams: boolean;
  statsPlayers: boolean;
  standings: boolean;
  players: boolean;
  odds: boolean;
}

export interface BkSeasonInfo {
  season: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  coverage: BkCoverageInfo | null;
}

export interface BkTeamRef {
  id: number;
  name: string;
  slug: string | null;
  logo: string | null;
}

export interface BkStandingRow {
  position: number | null;
  team: BkTeamRef;
  gamesPlayed: number | null;
  won: number | null;
  lost: number | null;
  winPercentage: string | null;
  pointsFor: number | null;
  pointsAgainst: number | null;
  pointsDifference: number | null;
  form: string | null;
  description: string | null;
  descriptionText: string | null;
}

export interface BkStandingsGroup {
  groupName: string | null;
  stage: string | null;
  rows: BkStandingRow[];
}

export interface BkGameSummary {
  id: number;
  slug: string | null;
  kickoff: string | null; // ISO OffsetDateTime
  statusShort: string | null;
  statusText: string | null;
  homeTeam: BkTeamRef;
  awayTeam: BkTeamRef;
  homeTotal: number | null;
  awayTotal: number | null;
  stage: string | null;
  week: string | null;
}

export interface BkTopPlayerView {
  rank: number | null;
  playerId: number | null;
  playerName: string | null;
  playerSlug: string | null;
  playerPhoto: string | null;
  playerNationality: string | null;
  team: BkTeamRef | null;
  value: string | null;
  gamesPlayed: number | null;
}

export interface BkHreflangAlt {
  lang: string;
  url: string;
}

export interface BasketballLeagueSeoResponse {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  jsonLd: string | null;
  breadcrumbsJsonLd: string | null;
  hreflang: BkHreflangAlt[] | null;
}

export interface BasketballLeagueDetailResponse {
  id: number;
  slug: string;
  name: string;
  type: string | null;
  logo: string | null;
  country: BkLeagueCountry | null;
  currentSeason: string | null;
  selectedSeason: string | null;
  seasons: BkSeasonInfo[];
  coverage: BkCoverageInfo | null;
  standings: BkStandingsGroup[];
  recentGames: BkGameSummary[];
  upcomingGames: BkGameSummary[];
  topScorers: BkTopPlayerView[];
  topRebounders: BkTopPlayerView[];
  topAssists: BkTopPlayerView[];
  seo: BasketballLeagueSeoResponse | null;
}

// ===== Standings sayfasi (slug bazli; lig detayinda kullanmiyoruz ama
// BFF route paritesi icin model tutuluyor) =====

export interface BkStandingsPageLeagueHero {
  id: number;
  name: string;
  displayName: string | null;
  type: string | null;
  slug: string | null;
  logo: string | null;
  countryName: string | null;
  countryFlag: string | null;
}

export interface BkStandingsPageTeamRef {
  id: number;
  name: string;
  displayName: string | null;
  logo: string | null;
  slug: string | null;
}

export interface BkStandingsPageRow {
  position: number | null;
  team: BkStandingsPageTeamRef;
  gamesPlayed: number | null;
  won: number | null;
  lost: number | null;
  winPercentage: string | null;
  pointsFor: number | null;
  pointsAgainst: number | null;
  pointsDifference: number | null;
  form: string | null;
  description: string | null;
}

export interface BkStandingsPageGroup {
  groupName: string | null;
  stage: string | null;
  rows: BkStandingsPageRow[];
}

export interface BasketballStandingsPageResponse {
  league: BkStandingsPageLeagueHero;
  currentSeason: string | null;
  availableSeasons: string[];
  groups: BkStandingsPageGroup[];
  lastSyncedAt: string | null;
}
