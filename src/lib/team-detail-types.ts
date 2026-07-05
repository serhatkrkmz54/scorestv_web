// Backend TeamDetailResponse TS karsiligi.
// Endpoint: GET /api/v1/teams/{slug}?lang=tr|en&season=YYYY

import type { FixtureSummary } from "./fixtures-types";

export interface TeamCountryInfo {
  name?: string | null;
  code?: string | null;
  flag?: string | null;
}

export interface TeamVenueInfo {
  id?: number | null;
  name?: string | null;
  city?: string | null;
  address?: string | null;
  capacity?: number | null;
  surface?: string | null;
  image?: string | null;
}

export interface TeamSeasonOption {
  year: number;
  startDate?: string | null;
  endDate?: string | null;
  current: boolean;
}

/**
 * Lig basina sezon istatistikleri. stats JSONB passthrough:
 * fixtures{played/wins/draws/loses{home/away/total}}, goals{for/against{total/average{home/away/total}, minute}},
 * biggest{streak{wins/draws/loses}, wins{home/away}, loses{home/away}, goals{for/against{home/away}}},
 * clean_sheet{home/away/total}, failed_to_score{home/away/total}, penalty{scored/missed/total},
 * lineups[], cards{yellow/red[minute]}, form
 */
export interface TeamStatisticsByLeague {
  leagueId: number;
  leagueName?: string | null;
  leagueLogo?: string | null;
  leagueSlug?: string | null;
  stats?: Record<string, unknown> | null;
}

export interface TeamSquadPlayer {
  playerId: number;
  name: string;
  age?: number | null;
  number?: number | null;
  position?: string | null;
  photo?: string | null;
}

export interface TeamSquadGroup {
  position: string;
  positionText?: string | null;
  players: TeamSquadPlayer[];
}

export interface TeamStandingsPosition {
  leagueId: number;
  leagueName?: string | null;
  leagueLogo?: string | null;
  leagueSlug?: string | null;
  groupName?: string | null;
  groupNameText?: string | null;
  rank?: number | null;
  points?: number | null;
  goalsDiff?: number | null;
  played?: number | null;
  win?: number | null;
  draw?: number | null;
  lose?: number | null;
  form?: string | null;
  description?: string | null;
  descriptionText?: string | null;
}

export interface TeamTransferRow {
  date?: string | null;
  /** "in" | "out" */
  direction: string;
  type?: string | null;
  typeText?: string | null;
  playerId?: number | null;
  playerName?: string | null;
  counterpartyTeamId?: number | null;
  counterpartyTeamName?: string | null;
  counterpartyTeamLogo?: string | null;
  counterpartyTeamSlug?: string | null;
}

export interface TeamCoachCareerEntry {
  start?: string | null;
  end?: string | null;
}

export interface TeamCoachTrophyEntry {
  league?: string | null;
  leagueText?: string | null;
  country?: string | null;
  countryText?: string | null;
  season?: string | null;
  place?: string | null;
  placeText?: string | null;
}

export interface TeamCoachBirth {
  date?: string | null;
  place?: string | null;
  country?: string | null;
}

export interface TeamCoachInfo {
  coachId?: number | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  nationality?: string | null;
  photo?: string | null;
  birth?: TeamCoachBirth | null;
  careerWithTeam?: TeamCoachCareerEntry[] | null;
  trophies?: TeamCoachTrophyEntry[] | null;
}

export interface TeamSidelinedRow {
  playerId?: number | null;
  playerName?: string | null;
  playerPhoto?: string | null;
  type?: string | null;
  typeText?: string | null;
  start?: string | null;
  end?: string | null;
}

export interface TeamPlayerSeasonStat {
  playerId: number;
  playerName?: string | null;
  playerPhoto?: string | null;
  leagueId?: number | null;
  leagueName?: string | null;
  leagueLogo?: string | null;
  leagueSlug?: string | null;
  position?: string | null;
  positionText?: string | null;
  /** Ham JSONB — games/goals/shots/passes/tackles/duels/dribbles/fouls/cards/penalty/substitutes */
  stats?: Record<string, unknown> | null;
}

export interface TeamSeoResponse {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  slug?: string | null;
  locale?: string | null;
  openGraph?: {
    title?: string | null;
    description?: string | null;
    type?: string | null;
    url?: string | null;
    image?: string | null;
    siteName?: string | null;
    locale?: string | null;
  } | null;
  twitter?: {
    card?: string | null;
    title?: string | null;
    description?: string | null;
    image?: string | null;
  } | null;
  jsonLd?: string | null;
  breadcrumbs?: { position: number; name: string; url: string }[];
  hreflang?: { lang: string; href: string }[];
}

export interface TeamDetailResponse {
  id: number;
  slug: string;
  name: string;
  nameRaw?: string | null;
  logo?: string | null;
  founded?: number | null;
  national: boolean;
  fifaRank?: number | null;
  code?: string | null;
  country?: TeamCountryInfo | null;
  venue?: TeamVenueInfo | null;
  selectedSeason?: number | null;
  seasons: TeamSeasonOption[];
  statistics: TeamStatisticsByLeague[];
  squad: TeamSquadGroup[];
  recentFixtures: FixtureSummary[];
  upcomingFixtures: FixtureSummary[];
  standingsPositions: TeamStandingsPosition[];
  transfers: TeamTransferRow[];
  currentCoach?: TeamCoachInfo | null;
  sidelined: TeamSidelinedRow[];
  playerStats: TeamPlayerSeasonStat[];
  seo?: TeamSeoResponse | null;
}
