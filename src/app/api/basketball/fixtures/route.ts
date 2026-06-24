import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import { buildMatchSlug } from "@/lib/slug-utils";
import { categorizeSport } from "@/lib/sport-scores";
import type {
  BasketballGameSummary,
  RawBasketballGame,
  SportDayResponse,
  SportLeagueGroup,
} from "@/lib/sport-scores-types";

// Basketbol anasayfa fikstur listesi (public). Backend
// /api/v1/basketball/games proxy'lenir, lige gore gruplanmis ortak modele
// donusturulur (futbol /api/fixtures yanit sekline benzer).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const date = sp.get("date");
  const status = sp.get("status") ?? "all";
  const lang = sp.get("lang") ?? "tr";

  // status=live ise /games/live, aksi halde /games?date=
  const qs = new URLSearchParams({ lang });
  let path: string;
  if (status === "live") {
    path = `/api/v1/basketball/games/live?${qs.toString()}`;
  } else {
    if (date) qs.set("date", date);
    path = `/api/v1/basketball/games?${qs.toString()}`;
  }

  const r = await backendJson<RawBasketballGame[]>(path, { method: "GET" });
  if (!r.ok || !r.body) {
    return NextResponse.json(
      { message: "Basketbol fikstür verisi alınamadı." },
      { status: r.status },
    );
  }

  const games = Array.isArray(r.body) ? r.body : [];
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

  const body: SportDayResponse = {
    sport: "basketball",
    date: date ?? null,
    gameCount: summaries.length,
    liveCount,
    leagues: Array.from(groups.values()),
  };
  return NextResponse.json(body);
}
