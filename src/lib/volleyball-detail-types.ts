// Backend VolleyballGameDetailResponse TypeScript karsiligi (birebir alan adlari).
// Endpoint: GET /api/v1/volleyball/games/detail/{slug}?lang=tr|en

export interface VolleyballStatus {
  shortName: string | null;
  longName: string | null;
  statusText: string | null;
}

export interface VolleyballTeamRef {
  id: number;
  name: string;
  displayName: string | null;
  logo: string | null;
  slug: string | null;
}

export interface VolleyballSetScore {
  setNumber: number | null;
  home: number | null;
  away: number | null;
}

export interface VolleyballScoreBreakdown {
  homeSets: number | null;
  awaySets: number | null;
  sets: VolleyballSetScore[];
}

export interface VolleyballLeagueRef {
  id: number;
  name: string;
  type: string | null;
  slug: string | null;
  logo: string | null;
  countryName: string | null;
  countryFlag: string | null;
  season: string | null;
}

export interface VolleyballTeamSeasonStatsView {
  team: VolleyballTeamRef;
  gamesPlayed: number | null;
  wins: number | null;
  loses: number | null;
  winPercentage: string | null;
  setsForTotal: number | null;
  setsForAvg: number | null;
  setsAgainstTotal: number | null;
  setsAgainstAvg: number | null;
  form: string | null;
}

export interface VolleyballH2hGameView {
  id: number;
  slug: string | null;
  kickoff: string;
  statusShort: string | null;
  statusText: string | null;
  homeTeam: VolleyballTeamRef;
  awayTeam: VolleyballTeamRef;
  homeSets: number | null;
  awaySets: number | null;
  winnerSide: string | null; // "home" | "away" | null
}

export interface VolleyballStandingRow {
  position: number | null;
  team: VolleyballTeamRef;
  gamesPlayed: number | null;
  won: number | null;
  lost: number | null;
  winPercentage: string | null;
  setsFor: number | null;
  setsAgainst: number | null;
  setsDifference: number | null;
  points: number | null;
  form: string | null;
  description: string | null;
}

export interface VolleyballStandingsGroup {
  groupName: string | null;
  stage: string | null;
  rows: VolleyballStandingRow[];
}

// Backend SeoBundle (basketbol esi). Alan adlari birebir.
export interface VolleyballHreflangAlt {
  lang: string | null;
  url: string | null;
}

export interface VolleyballSeoBundle {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  jsonLd: string | null;
  breadcrumbsJsonLd: string | null;
  hreflang: VolleyballHreflangAlt[];
}

export interface VolleyballGameDetailResponse {
  id: number;
  slug: string | null;
  stage: string | null;
  week: string | null;
  kickoff: string;
  lastSyncedAt: string | null;
  status: VolleyballStatus;
  homeTeam: VolleyballTeamRef;
  awayTeam: VolleyballTeamRef;
  score: VolleyballScoreBreakdown | null;
  league: VolleyballLeagueRef;
  teamStats: VolleyballTeamSeasonStatsView[];
  headToHead: VolleyballH2hGameView[];
  standings: VolleyballStandingsGroup[];
  seo: VolleyballSeoBundle | null;
}
