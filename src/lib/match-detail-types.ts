// Backend MatchDetailResponse TypeScript karsiligi.
// Endpoint: GET /api/v1/fixtures/{slug}?lang=tr|en
// Backend DTO'lar genelde FLAT yapilidir (EventSummary, StandingRow, InjuryGroup).

// ====== Status / Team / Score ======

export interface MatchStatus {
  shortCode: string;
  longText: string;
  elapsed?: number | null;
  extra?: number | null;
}

export interface MatchTeam {
  id: number;
  name: string;
  logo?: string | null;
  slug?: string | null;
}

export interface MatchScorePeriod {
  home: number | null;
  away: number | null;
}

export interface MatchScore {
  home?: number | null;
  away?: number | null;
  halftime?: MatchScorePeriod | null;
  extraTime?: MatchScorePeriod | null;
  penalty?: MatchScorePeriod | null;
}

// ====== Venue / League ======

export interface MatchVenue {
  id?: number | null;
  name?: string | null;
  city?: string | null;
  capacity?: number | null;
  surface?: string | null;
}

export interface MatchLeagueRef {
  id: number;
  name: string;
  type?: string | null;
  logo?: string | null;
  country?: string | null;
  countryFlag?: string | null;
  season?: number | null;
  slug?: string | null;
}

// ====== Events (FLAT) ======

export interface MatchEvent {
  elapsed?: number | null;
  extra?: number | null;
  teamId: number;
  type: string;
  typeText?: string | null;
  detail?: string | null;
  detailText?: string | null;
  comments?: string | null;
  playerId?: number | null;
  playerName?: string | null;
  assistId?: number | null;
  assistName?: string | null;
}

// ====== Lineups ======

export interface MatchLineupPlayer {
  id?: number | null;
  name: string;
  number?: number | null;
  position?: string | null;
  grid?: string | null;
}

export interface MatchLineupColorSet {
  primary?: string | null;
  number?: string | null;
  border?: string | null;
}

export interface MatchLineupColors {
  player?: MatchLineupColorSet | null;
  goalkeeper?: MatchLineupColorSet | null;
}

export interface MatchLineupCoach {
  id?: number | null;
  name?: string | null;
  photo?: string | null;
}

export interface MatchLineupView {
  teamId: number;
  formation?: string | null;
  coach?: MatchLineupCoach | null;
  colors?: MatchLineupColors | null;
  announcedAt?: string | null;
  startXI: MatchLineupPlayer[];
  substitutes: MatchLineupPlayer[];
}

// ====== Statistics ======

export interface MatchStatisticView {
  type: string;
  typeText?: string | null;
  home: string | number | null;
  away: string | number | null;
}

// ====== Player Stats placeholder ======

export interface MatchPlayerStatGroup {
  teamId: number;
  players: Array<Record<string, unknown>>;
}

// ====== H2H (FLAT) ======

export interface MatchH2hTeam {
  id: number;
  name: string;
  logo?: string | null;
  slug?: string | null;
}

export interface MatchH2hLeagueRef {
  id: number;
  name: string;
  logo?: string | null;
}

export interface MatchH2hFixture {
  id: number;
  slug?: string | null;
  kickoff: string;
  league?: MatchH2hLeagueRef | null;
  homeTeam: MatchH2hTeam;
  awayTeam: MatchH2hTeam;
  homeScore?: number | null;
  awayScore?: number | null;
  status: string;
  statusText?: string | null;
}

// ====== Standings (FLAT row) ======

export interface MatchStandingRow {
  rank: number;
  teamId: number;
  teamName: string;
  teamLogo?: string | null;
  teamSlug?: string | null;
  points: number;
  goalsDiff: number;
  form?: string | null;
  description?: string | null;
  descriptionText?: string | null;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface MatchStandingsGroup {
  groupName: string;
  groupNameText?: string | null;
  rows: MatchStandingRow[];
}

// ====== Injuries (teamId + players) ======

export interface MatchInjuryItem {
  playerId?: number | null;
  playerName?: string | null;
  photo?: string | null;
  type?: string | null;
  typeText?: string | null;
  reason?: string | null;
  reasonText?: string | null;
}

export interface MatchInjuryGroup {
  teamId: number;
  players: MatchInjuryItem[];
}

// ====== Prediction ======

export interface MatchPredictionPair {
  home?: string | null;
  away?: string | null;
}

export interface MatchPredictionWinner {
  teamId?: number | null;
  comment?: string | null;
  commentText?: string | null;
}

export interface MatchPredictionView {
  winner?: MatchPredictionWinner | null;
  winOrDraw?: boolean | null;
  advice?: string | null;
  underOver?: string | null;
  goals?: MatchPredictionPair | null;
  percent?: { home?: string | null; draw?: string | null; away?: string | null } | null;
  comparison?: {
    form?: MatchPredictionPair | null;
    att?: MatchPredictionPair | null;
    def?: MatchPredictionPair | null;
    poisson?: MatchPredictionPair | null;
    h2h?: MatchPredictionPair | null;
    goals?: MatchPredictionPair | null;
    total?: MatchPredictionPair | null;
  } | null;
  teams?: Record<string, unknown> | null;
}

// ====== SEO ======

export interface MatchSeoResponse {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string | null;
  openGraph?: Record<string, string>;
  twitter?: Record<string, string>;
  jsonLd?: string;
  breadcrumbJsonLd?: string;
  hreflang?: { hreflang: string; href: string }[];
}

// ====== Bracket ======

export interface MatchBracketTeam {
  id: number;
  name: string;
  logo?: string | null;
  slug?: string | null;
}

export interface MatchBracketLeg {
  fixtureId: number;
  fixtureSlug?: string | null;
  kickoff: string;
  status: string;
  statusText?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeamId: number;
  awayTeamId: number;
  legLabel?: string | null;
}

export interface MatchBracketTie {
  tieId: string;
  legsCount: number;
  home?: MatchBracketTeam | null;
  away?: MatchBracketTeam | null;
  legs: MatchBracketLeg[];
  aggregateHome?: number | null;
  aggregateAway?: number | null;
  penaltyHome?: number | null;
  penaltyAway?: number | null;
  winnerTeamId?: number | null;
  inProgress?: boolean | null;
}

export interface MatchBracketRound {
  name: string;
  nameText?: string | null;
  order: number;
  tiesCount: number;
  ties: MatchBracketTie[];
}

export interface MatchBracketChampion {
  teamId?: number | null;
  teamName?: string | null;
  teamLogo?: string | null;
  teamSlug?: string | null;
}

export interface MatchBracketView {
  rounds: MatchBracketRound[];
  champion?: MatchBracketChampion | null;
}

// ====== Broadcast / Odds ======

export interface MatchBroadcast {
  channelId?: number | null;
  name?: string | null;
  logo?: string | null;
  url?: string | null;
  source?: string | null;
}

// Bilyoner DTO ile birebir — mobil ve backend ile uyumlu.
export interface MatchOddOutcome {
  label: string;
  odd: string;
}

export interface MatchOddMarket {
  name: string;
  outcomes: MatchOddOutcome[];
}

export interface MatchOdds {
  provider: string;
  clickUrl: string;
  markets: MatchOddMarket[];
}

// ====== Ana yanit ======

export interface MatchDetailResponse {
  id: number;
  slug?: string | null;
  round?: string | null;
  kickoff: string;
  lastSyncedAt?: string | null;
  status: MatchStatus;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: MatchScore;
  venue?: MatchVenue | null;
  league: MatchLeagueRef;
  referee?: string | null;
  events: MatchEvent[];
  lineups: MatchLineupView[];
  statistics: MatchStatisticView[];
  playerStats: MatchPlayerStatGroup[];
  headToHead: MatchH2hFixture[];
  standings: MatchStandingsGroup[];
  injuries: MatchInjuryGroup[];
  prediction?: MatchPredictionView | null;
  broadcasts: MatchBroadcast[];  bracket?: MatchBracketView | null;
  seo?: MatchSeoResponse | null;
  odds?: MatchOdds | null;
}
