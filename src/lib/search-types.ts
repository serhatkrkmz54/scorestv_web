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

// Koç sonucu — detay sayfasi yok; mevcut takim biliniyorsa satira tiklayinca
// takim sayfasina gidilir. currentTeamId/currentTeamName null olabilir.
export interface SearchCoachHit {
  id: number;
  name: string;
  nationality: string | null;
  age: number | null;
  photoUrl: string | null;
  currentTeamId: number | null;
  currentTeamName: string | null;
}

// Haber sonucu — slug ile /haber/<slug> (TR) veya /news/<slug> (EN) detayina
// gidilir. coverImageUrl kart gorseli, publishedAt tarih rozeti, lang dil.
export interface SearchNewsHit {
  id: number;
  slug: string;
  lang: string | null;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export interface SearchResponse {
  query: string;
  tookMs: number;
  teams: SearchTeamHit[];
  leagues: SearchLeagueHit[];
  players: SearchPlayerHit[];
  fixtures: SearchFixtureHit[];
  countries: SearchCountryHit[];
  coaches: SearchCoachHit[];
  // Haberler (news) — backend YENI ekledi; eski payload'larda gelmeyebilir.
  news?: SearchNewsHit[];
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
  coaches: [],
  news: [],
};

export function searchHitCount(r: SearchResponse): number {
  return (
    r.teams.length +
    r.leagues.length +
    r.players.length +
    r.fixtures.length +
    r.countries.length +
    (r.coaches?.length ?? 0) +
    (r.news?.length ?? 0)
  );
}
