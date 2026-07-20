// Basketbol/voleybol ham oyun listesini (backend /api/v1/{sport}/games)
// lige gore gruplanmis ortak SportDayResponse modeline donusturur.
// Hem BFF rotalari (/api/basketball|volleyball/fixtures) hem de SSR helper
// (fetchSportHomeServer) bu SAF fonksiyonlari kullanir — tek kaynak (DRY).
import { buildMatchSlug } from "./slug-utils";
import { categorizeSport } from "./sport-scores";
import type {
  BasketballGameSummary,
  RawBasketballGame,
  RawVolleyballGame,
  SportDayResponse,
  SportLeagueGroup,
  VolleyballGameSummary,
} from "./sport-scores-types";

export function mapBasketballDay(
  games: RawBasketballGame[],
  date: string | null,
): SportDayResponse {
  const summaries: BasketballGameSummary[] = games.map((g) => ({
    sport: "basketball",
    id: g.id,
    slug: buildMatchSlug(g.home?.name ?? "home", g.away?.name ?? "away", g.id),
    startAt: g.startAt,
    season: g.season ?? null,
    status: {
      shortCode: g.status?.shortCode ?? null,
      longName: g.status?.longName ?? null,
      timer: g.status?.timer ?? null,
    },
    league: {
      id: g.league?.id ?? 0,
      name: g.league?.name ?? "",
      logo: g.league?.logo ?? null,
      country: g.league?.country ?? null,
      countryFlag: g.league?.countryFlag ?? null,
    },
    home: { id: g.home?.id ?? 0, name: g.home?.name ?? "", logo: g.home?.logo ?? null },
    away: { id: g.away?.id ?? 0, name: g.away?.name ?? "", logo: g.away?.logo ?? null },
    score: {
      homeTotal: g.score?.homeTotal ?? null,
      awayTotal: g.score?.awayTotal ?? null,
      home: g.score?.home ?? { q1: null, q2: null, q3: null, q4: null, ot: null },
      away: g.score?.away ?? { q1: null, q2: null, q3: null, q4: null, ot: null },
    },
  }));

  const groups = new Map<number, SportLeagueGroup>();
  let liveCount = 0;
  for (const s of summaries) {
    if (categorizeSport("basketball", s.status) === "live") liveCount++;
    let grp = groups.get(s.league.id);
    if (!grp) {
      grp = { league: s.league, games: [] };
      groups.set(s.league.id, grp);
    }
    grp.games.push(s);
  }

  return {
    sport: "basketball",
    date: date ?? null,
    gameCount: summaries.length,
    liveCount,
    leagues: Array.from(groups.values()),
  };
}

export function mapVolleyballDay(
  games: RawVolleyballGame[],
  date: string | null,
): SportDayResponse {
  const summaries: VolleyballGameSummary[] = games.map((g) => ({
    sport: "volleyball",
    id: g.id,
    slug: buildMatchSlug(g.home?.name ?? "home", g.away?.name ?? "away", g.id),
    startAt: g.startAt,
    season: g.season ?? null,
    status: {
      shortCode: g.status?.shortCode ?? null,
      longName: g.status?.longName ?? null,
    },
    league: {
      id: g.league?.id ?? 0,
      name: g.league?.name ?? "",
      logo: g.league?.logo ?? null,
      country: g.league?.country ?? null,
      countryFlag: g.league?.countryFlag ?? null,
    },
    home: { id: g.home?.id ?? 0, name: g.home?.name ?? "", logo: g.home?.logo ?? null },
    away: { id: g.away?.id ?? 0, name: g.away?.name ?? "", logo: g.away?.logo ?? null },
    score: {
      homeTotal: g.score?.homeTotal ?? null,
      awayTotal: g.score?.awayTotal ?? null,
      home: g.score?.home ?? { set1: null, set2: null, set3: null, set4: null, set5: null },
      away: g.score?.away ?? { set1: null, set2: null, set3: null, set4: null, set5: null },
    },
  }));

  const groups = new Map<number, SportLeagueGroup>();
  let liveCount = 0;
  for (const s of summaries) {
    if (categorizeSport("volleyball", s.status) === "live") liveCount++;
    let grp = groups.get(s.league.id);
    if (!grp) {
      grp = { league: s.league, games: [] };
      groups.set(s.league.id, grp);
    }
    grp.games.push(s);
  }

  return {
    sport: "volleyball",
    date: date ?? null,
    gameCount: summaries.length,
    liveCount,
    leagues: Array.from(groups.values()),
  };
}
