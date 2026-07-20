import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import { mapVolleyballDay } from "@/lib/sport-day";
import type { RawVolleyballGame } from "@/lib/sport-scores-types";

// Voleybol anasayfa fikstur listesi (public). Backend
// /api/v1/volleyball/games proxy'lenir, lige gore gruplanmis ortak modele
// donusturulur (transform: @/lib/sport-day → SSR helper ile ortak).
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
  return NextResponse.json(mapVolleyballDay(games, date));
}
