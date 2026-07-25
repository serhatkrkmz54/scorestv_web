// Voleybol lig detay tipleri — backend VolleyballLeagueDetailResponse ile 1:1.
// NOT: standings satirlari DUZ (flat) sekildedir (teamId/teamName/teamSlug),
// mac detayindaki VolleyballStandingRow'dan (nested TeamRef) FARKLIDIR.

export interface VlTeamRef {
  id: number | null;
  name: string | null;
  logo: string | null;
}

/** Lig fikstur listesi satiri (son/yaklasan maclar). */
export interface VlGameSummary {
  id: number | null;
  slug: string | null;
  kickoff: string | null; // ISO Instant
  statusShort: string | null; // NS | S1..S5 | FT | AW | POST | CANC ...
  statusText: string | null; // lokalize
  home: VlTeamRef | null;
  away: VlTeamRef | null;
  homeSets: number | null; // kazanilan set (0..3)
  awaySets: number | null;
  week: string | null;
}

/** Puan durumu satiri — standings page ile ayni FLAT sekil. */
export interface VlStandingRow {
  position: number | null;
  teamId: number | null;
  teamName: string | null;
  teamLogo: string | null;
  teamSlug: string;
  gamesPlayed: number | null;
  won: number | null;
  lost: number | null;
  winPercentage: string | null; // "0.667"
  setsFor: number | null;
  setsAgainst: number | null;
  setsDifference: number | null;
  points: number | null;
  form: string | null;
  description: string | null;
}

export interface VlStandingsGroup {
  groupName: string | null;
  stage: string | null;
  rows: VlStandingRow[];
}

export interface VlLeagueSeo {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  jsonLd: string; // stringified JSON-LD
  breadcrumbsJsonLd: string;
  hreflang: { lang: string; url: string }[];
}

export interface VolleyballLeagueDetailResponse {
  id: number | null;
  slug: string;
  name: string | null;
  type: string | null;
  logo: string | null;
  country: { name: string | null; code: string | null; flag: string | null } | null;
  currentSeason: string | null;
  selectedSeason: string | null;
  availableSeasons: string[];
  standings: VlStandingsGroup[];
  recentGames: VlGameSummary[];
  upcomingGames: VlGameSummary[];
  seo: VlLeagueSeo | null;
}
