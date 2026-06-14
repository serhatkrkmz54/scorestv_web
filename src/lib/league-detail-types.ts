// Backend LeagueDetailResponse TS karsiligi.
// Endpoint: GET /api/v1/leagues/{slug}?lang=tr|en&season=YYYY

import type { FixtureSummary } from "./fixtures-types";
import type {
  MatchStandingsGroup,
  MatchBracketView,
} from "./match-detail-types";

export interface LeagueCountry {
  name: string;
  code?: string | null;
  flag?: string | null;
}

export interface LeagueSeasonInfo {
  year: number;
  startDate?: string | null;
  endDate?: string | null;
  current: boolean;
}

export interface LeagueCoverageInfo {
  standings: boolean;
  events: boolean;
  lineups: boolean;
  statsFixtures: boolean;
  statsPlayers: boolean;
  players: boolean;
  topScorers: boolean;
  topAssists: boolean;
  topCards: boolean;
  injuries: boolean;
  predictions: boolean;
  odds: boolean;
}

export interface LeagueRoundGroup {
  roundName: string;
  roundNameText?: string | null;
  fixtures: FixtureSummary[];
}

export interface LeagueTopPlayerView {
  rank?: number | null;
  playerId?: number | null;
  playerName?: string | null;
  playerPhoto?: string | null;
  playerNationality?: string | null;
  playerAge?: number | null;
  teamId?: number | null;
  teamName?: string | null;
  teamLogo?: string | null;
  teamSlug?: string | null;
  value?: number | null;
  valueSecondary?: number | null;
  appearances?: number | null;
  minutes?: number | null;
}

export interface LeagueTopRatedPlayer {
  rank?: number | null;
  playerId?: number | null;
  playerName?: string | null;
  playerSlug?: string | null;
  playerPhoto?: string | null;
  playerNationality?: string | null;
  playerAge?: number | null;
  position?: string | null;
  positionText?: string | null;
  teamId?: number | null;
  teamName?: string | null;
  teamLogo?: string | null;
  teamSlug?: string | null;
  rating?: number | string | null;
  stats?: Record<string, unknown>;
}

export interface LeagueSeoResponse {
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

export interface LeagueDetailResponse {
  id: number;
  slug: string;
  name: string;
  type: string;
  logo?: string | null;
  country?: LeagueCountry | null;
  currentSeason?: number | null;
  selectedSeason?: number | null;
  seasons: LeagueSeasonInfo[];
  coverage?: LeagueCoverageInfo | null;
  standings: MatchStandingsGroup[];
  rounds: LeagueRoundGroup[];
  topScorers: LeagueTopPlayerView[];
  topAssists: LeagueTopPlayerView[];
  topYellowCards: LeagueTopPlayerView[];
  topRedCards: LeagueTopPlayerView[];
  topRatedPlayers: LeagueTopRatedPlayer[];
  bracket?: MatchBracketView | null;
  seo?: LeagueSeoResponse | null;
}
