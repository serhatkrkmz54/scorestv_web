// Voleybol takim detay tipleri — backend VolleyballTeamDetailResponse ile 1:1.
// Basketboldan LEANER: kadro/istatistik bloklari ve availableSeasons yok.

export interface VlTeamGameRef {
  id: number | null;
  slug: string;
  kickoff: string | null; // ISO Instant
  statusShort: string | null;
  leagueName: string | null;
  home: { id: number | null; name: string | null; logo: string | null };
  away: { id: number | null; name: string | null; logo: string | null };
  homeSets: number | null;
  awaySets: number | null;
}

export interface VlTeamSeasonStats {
  leagueId: number | null;
  leagueName: string | null;
  gamesPlayed: number | null;
  wins: number | null;
  loses: number | null; // backend yazimi "loses"
  winPercentage: string | null; // "0.667"
  setsForTotal: number | null;
  setsForAvg: number | null;
  setsAgainstTotal: number | null;
  setsAgainstAvg: number | null;
  form: string | null;
}

/** Takimin kendi puan durumu satir(lar)i. */
export interface VlTeamStandingRow {
  position: number | null;
  groupName: string | null;
  gamesPlayed: number | null;
  won: number | null;
  lost: number | null;
  setsFor: number | null;
  setsAgainst: number | null;
  points: number | null;
  form: string | null;
}

export interface VolleyballTeamDetailResponse {
  id: number | null;
  name: string | null;
  displayName: string | null;
  slug: string;
  logo: string | null;
  countryName: string | null;
  countryFlag: string | null;
  national: boolean;
  season: string | null;
  lastSyncedAt: string | null;
  seasonStats: VlTeamSeasonStats | null;
  recentGames: VlTeamGameRef[];
  upcomingGames: VlTeamGameRef[];
  standings: VlTeamStandingRow[];
}

/** GET /teams/{slug}/seo — sekli lig/mac SEO'sundan FARKLI (nested OG/Twitter,
 * tekil breadcrumbJsonLd, hreflang {hreflang,href}). */
export interface VolleyballTeamSeo {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string | null;
  jsonLd?: string;
  breadcrumbJsonLd?: string;
  hreflang?: { hreflang: string; href: string }[];
}
