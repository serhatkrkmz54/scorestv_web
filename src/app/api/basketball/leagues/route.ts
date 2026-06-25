import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { BasketballLeagueHubResponse } from "@/lib/basketball-league-types";

// Basketbol lig hub (public) — backend /api/v1/basketball/leagues/hub proxy.
// Sol ray + populer ligler bunu kullanir. country/search opsiyonel.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "tr";
  const country = sp.get("country");
  const search = sp.get("search");
  const qs = new URLSearchParams({ lang });
  if (country) qs.set("country", country);
  if (search) qs.set("search", search);

  const r = await backendJson<BasketballLeagueHubResponse>(
    `/api/v1/basketball/leagues/hub?${qs.toString()}`,
    { method: "GET" },
  );
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { totalLeagues: 0, countries: [] },
      { status: r.ok ? 200 : r.status },
    );
  }
  return NextResponse.json(r.body);
}
