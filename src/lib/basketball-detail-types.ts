// Backend BasketballGameDetailResponse TypeScript karsiligi (birebir alan adlari).
// Endpoint: GET /api/v1/basketball/games/detail/{slug}?lang=tr|en

export interface BasketballStatus {
  shortName: string | null;
  longName: string | null;
  timer: string | null;
  statusText: string | null;
}

export interface BasketballTeamRef {
  id: number;
  name: string;
  displayName: string | null;
  logo: string | null;
  slug: string | null;
}

export interface BasketballSidescoreLine {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  overTime: number | null;
  total: number | null;
}

export interface BasketballScoreBreakdown {
  home: BasketballSidescoreLine | null;
  away: BasketballSidescoreLine | null;
}

export interface BasketballLeagueRef {
  id: number;
  name: string;
  type: string | null;
  slug: string | null;
  logo: string | null;
  countryName: string | null;
  countryFlag: string | null;
  season: string | null;
}

export interface BasketballMadeAttempt {
  total: number | null;
  attempts: number | null;
  percentage: string | null;
}

export interface BasketballRebounds {
  total: number | null;
  offence: number | null;
  defense: number | null;
}

export interface BasketballTeamStatsView {
  team: BasketballTeamRef;
  fieldGoals: BasketballMadeAttempt | null;
  threepoint: BasketballMadeAttempt | null;
  freethrows: BasketballMadeAttempt | null;
  rebounds: BasketballRebounds | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  personalFouls: number | null;
}

export interface BasketballPlayerStatRow {
  playerId: number | null;
  playerName: string | null;
  minutes: string | null;
  points: number | null;
  fieldGoals: BasketballMadeAttempt | null;
  threepoint: BasketballMadeAttempt | null;
  freethrows: BasketballMadeAttempt | null;
  rebounds: BasketballRebounds | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  personalFouls: number | null;
}

export interface BasketballPlayerStatGroup {
  team: BasketballTeamRef;
  starters: BasketballPlayerStatRow[];
  bench: BasketballPlayerStatRow[];
}

export interface BasketballH2hGameView {
  id: number;
  slug: string | null;
  kickoff: string;
  statusShort: string | null;
  statusText: string | null;
  homeTeam: BasketballTeamRef;
  awayTeam: BasketballTeamRef;
  homeTotal: number | null;
  awayTotal: number | null;
  winnerSide: string | null; // "home" | "away" | "draw" | null
}

export interface BasketballStandingRow {
  position: number | null;
  team: BasketballTeamRef;
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

export interface BasketballStandingsGroup {
  groupName: string | null;
  stage: string | null;
  rows: BasketballStandingRow[];
}

export interface BasketballSeoHreflang {
  lang: string;
  url: string;
}

export interface BasketballSeoBundle {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  jsonLd: string | null;
  breadcrumbsJsonLd: string | null;
  hreflang: BasketballSeoHreflang[] | null;
}

export interface BasketballGameDetailResponse {
  id: number;
  slug: string | null;
  stage: string | null;
  week: string | null;
  kickoff: string;
  lastSyncedAt: string | null;
  status: BasketballStatus;
  homeTeam: BasketballTeamRef;
  awayTeam: BasketballTeamRef;
  score: BasketballScoreBreakdown | null;
  league: BasketballLeagueRef;
  teamStats: BasketballTeamStatsView[];
  playerStats: BasketballPlayerStatGroup[];
  headToHead: BasketballH2hGameView[];
  standings: BasketballStandingsGroup[];
  seo: BasketballSeoBundle | null;
}
