import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import { buildMatchSlug } from "@/lib/slug-utils";
import { categorizeSport } from "@/lib/sport-scores";
import type {
  RawVolleyballGame,
  SportDayResponse,
  SportLeagueGroup,
  VolleyballGameSummary,
} from "@/lib/sport-scores-types";

// Voleybol anasayfa fikstur listesi (public). Backend
// /api/v1/volleyball/games proxy'lenir, lige gore gruplanmis ortak modele
// donusturulur.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const date = sp.get("date");
  const status = sp.get("status") ?? "all";
  const lang = sp.get("lang") ?? "tr";

  const qs = new URLSearchParams({ lang });
  let path: string;
  if (status === "live") {
    path = `/api/v1/volleyball/games/live?${qs.toString()}`;
  } else {
    if (date) qs.set("date", date);
    path = `/api/v1/volleyball/games?${qs.toString()}`;
  }

  const r = await backendJson<RawVolleyballGame[]>(path, { method: "GET" });
  if (!r.ok || !r.body) {
    return NextResponse.json(
      { message: "Voleybol fikstür verisi alınamadı." },
      { status: r.status },
    );
  }

  const games = Array.isArray(r.body) ? r.body : [];
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

  const body: SportDayResponse = {
    sport: "volleyball",
    date: date ?? null,
    gameCount: summaries.length,
    liveCount,
    leagues: Array.from(groups.values()),
  };
  return NextResponse.json(body);
}
