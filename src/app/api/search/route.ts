// BFF proxy: GET /api/search?q=...&types=...&lang=...
//
// - Spring backend'in /api/v1/search endpoint'ine pass-through eder.
// - lang param'i opsiyonel — backend zaten lang-agnostic (Elasticsearch hem
//   name hem nameTr field'inda eslesir), ama gelecekte localized ranking
//   yapilirsa zaten hazir olsun.
// - Cache: no-store — kullanici yazarken her tus bir istek; debounce
//   frontend tarafinda.

import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import { EMPTY_SEARCH, type SearchResponse } from "@/lib/search-types";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json(EMPTY_SEARCH);
  }
  const types = req.nextUrl.searchParams.get("types") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") ?? "tr";

  const qs = new URLSearchParams();
  qs.set("q", q);
  if (types) qs.set("types", types);
  if (lang) qs.set("lang", lang);

  const r = await backendJson<SearchResponse>(`/api/v1/search?${qs.toString()}`);
  if (!r.ok || !r.body) {
    // Backend offline veya hata — empty payload don, dropdown sessizce kapanir.
    return NextResponse.json(EMPTY_SEARCH, { status: r.status === 503 ? 200 : r.status });
  }
  return NextResponse.json(r.body);
}
