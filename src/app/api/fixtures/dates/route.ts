import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { FixtureDatesResponse } from "@/lib/fixtures-types";

// Tarih şeridi: bugün ± gün için (toplam, canlı) sayılar.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const days = sp.get("days") ?? "7";
  const lang = sp.get("lang") ?? "tr";

  const qs = new URLSearchParams({ days, lang });
  const r = await backendJson<FixtureDatesResponse>(`/api/v1/fixtures/dates?${qs.toString()}`, {
    method: "GET",
  });

  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Tarih verisi alınamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
