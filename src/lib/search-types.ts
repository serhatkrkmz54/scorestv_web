// Backend SearchResponse (com.scorestv.search.service.SearchResponse) TS mirror.
//
// Endpoint: GET /api/v1/search?q=<query>&types=<csv>
//   types  = "team,league,player,fixture,country" (CSV); bos = hepsi
//
// Backend tek payload'da tum tipleri grupli doner — frontend dropdown'da
// her grup ayri "Takimlar / Ligler / Oyuncular / Maclar / Ulkeler" basligi
// altinda render eder.
//
// Edge n-gram + AUTO fuzziness destekli — 1 karakterden sonra anlamli sonuc
// gelir. TR + EN ortakla aramaya: "Tur" → "Türkiye", "Galat" → "Galatasaray".

export interface SearchTeamHit {
  id: number;
  name: string;
  nameTr: string | null;
  slug: string;
  country: string | null;
  countryTr: string | null;
  logoUrl: string | null;
}

export interface SearchLeagueHit {
  id: number;
  name: string;
  nameTr: string | null;
  slug: string;
  country: string | null;
  countryTr: string | null;
  type: string | null;
  logoUrl: string | null;
  flagUrl: string | null;
}

export interface SearchPlayerHit {
  id: number;
  name: string;
  slug: string;
  nationality: string | null;
  age: number | null;
  photoUrl: string | null;
}

export interface SearchFixtureHit {
  id: number;
  slug: string;
  matchup: string;
  matchupTr: string | null;
  leagueId: number | null;
  leagueName: string | null;
  leagueNameTr: string | null;
  kickoff: string | null;
  statusShort: string | null;
}

export interface SearchCountryHit {
  id: number;
  name: string;
  nameTr: string | null;
  slug: string;
  code: string | null;
  flagUrl: string | null;
}

export interface SearchResponse {
  query: string;
  tookMs: number;
  teams: SearchTeamHit[];
  leagues: SearchLeagueHit[];
  players: SearchPlayerHit[];
  fixtures: SearchFixtureHit[];
  countries: SearchCountryHit[];
}

// Empty (no-result) sentinel — UI render kolaylasir.
export const EMPTY_SEARCH: SearchResponse = {
  query: "",
  tookMs: 0,
  teams: [],
  leagues: [],
  players: [],
  fixtures: [],
  countries: [],
};

export function searchHitCount(r: SearchResponse): number {
  return (
    r.teams.length +
    r.leagues.length +
    r.players.length +
    r.fixtures.length +
    r.countries.length
  );
}
