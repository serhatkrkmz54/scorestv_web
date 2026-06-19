// Backend PlayerDetailResponse TS karsiligi.
// Endpoint: GET /api/v1/players/{slug}?lang=tr|en&season=YYYY

export interface PlayerTeamRef {
  id: number;
  name: string;
  logo?: string | null;
  slug?: string | null;
}

export interface PlayerBirthInfo {
  date?: string | null;
  place?: string | null;
  country?: string | null;
  countryText?: string | null;
}

export interface PlayerCareerTeamView {
  team: PlayerTeamRef;
  seasons: number[];
}

export interface PlayerSeasonStatView {
  teamId?: number | null;
  teamName?: string | null;
  teamLogo?: string | null;
  teamSlug?: string | null;
  leagueId?: number | null;
  leagueName?: string | null;
  leagueLogo?: string | null;
  leagueSlug?: string | null;
  position?: string | null;
  positionText?: string | null;
  /** Ham JSONB passthrough — games/goals/shots/passes/tackles/duels/dribbles/fouls/cards/penalty/substitutes */
  stats?: Record<string, unknown> | null;
}

export interface PlayerSidelinedRow {
  type?: string | null;
  typeText?: string | null;
  start?: string | null;
  end?: string | null;
}

export interface PlayerTransferRow {
  date?: string | null;
  type?: string | null;
  typeText?: string | null;
  fromTeam?: PlayerTeamRef | null;
  toTeam?: PlayerTeamRef | null;
}

export interface PlayerTrophyView {
  league?: string | null;
  leagueText?: string | null;
  country?: string | null;
  countryText?: string | null;
  season?: string | null;
  place?: string | null;
  placeText?: string | null;
}

export interface PlayerSeoResponse {
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

export interface PlayerDetailResponse {
  id: number;
  slug: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  nationality?: string | null;
  nationalityText?: string | null;
  photo?: string | null;
  height?: string | null;
  weight?: string | null;
  /** Ana pozisyon — API-Football games.position (ham + çevrilmiş). */
  position?: string | null;
  positionText?: string | null;
  /** Kullandığı ayak — TheSportsDB strSide (ham + çevrilmiş). Olmayabilir. */
  foot?: string | null;
  footText?: string | null;
  injured?: boolean | null;
  birth?: PlayerBirthInfo | null;
  currentTeam?: PlayerTeamRef | null;
  selectedSeason?: number | null;
  seasons: number[];
  careerTeams: PlayerCareerTeamView[];
  seasonStats: PlayerSeasonStatView[];
  sidelined: PlayerSidelinedRow[];
  transfers: PlayerTransferRow[];
  trophies: PlayerTrophyView[];
  seo?: PlayerSeoResponse | null;
}
