import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { FixtureDayResponse } from "@/lib/fixtures-types";

// Anasayfa fikstür listesi (public). Backend'e proxy.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const date = sp.get("date");
  const status = sp.get("status") ?? "all";
  const lang = sp.get("lang") ?? "tr";

  const qs = new URLSearchParams({ status, lang });
  if (date) qs.set("date", date);

  const r = await backendJson<FixtureDayResponse>(`/api/v1/fixtures?${qs.toString()}`, {
    method: "GET",
  });

  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Fikstür verisi alınamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
