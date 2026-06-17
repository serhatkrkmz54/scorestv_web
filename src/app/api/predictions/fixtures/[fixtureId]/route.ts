import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import type { PredictionResult } from "@/lib/prediction-types";

/**
 * Maç sonucu tahmin oylaması BFF — anonim. voterId tarayıcı başına bir cookie
 * (stv_voter) ile yönetilir; backend kullanıcı/cihaz başına tek oy tutar.
 * GET: dağılım + kendi seçimi. POST {choice}: oy ver/değiştir (kickoff'tan önce).
 */
const COOKIE = "stv_voter";
const EMPTY: PredictionResult = {
  home: 0,
  draw: 0,
  away: 0,
  total: 0,
  myChoice: null,
  votingOpen: false,
};

function voterFrom(req: NextRequest): { voter: string; fresh: boolean } {
  const existing = req.cookies.get(COOKIE)?.value;
  if (existing && existing.length <= 64) return { voter: existing, fresh: false };
  return { voter: crypto.randomUUID(), fresh: true };
}

function withCookie(res: NextResponse, voter: string, fresh: boolean): NextResponse {
  if (fresh) {
    res.cookies.set(COOKIE, voter, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 yıl
      sameSite: "lax",
    });
  }
  return res;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ fixtureId: string }> },
) {
  const { fixtureId } = await ctx.params;
  const { voter, fresh } = voterFrom(req);
  const r = await backendJson<PredictionResult>(
    `/api/v1/predictions/fixtures/${encodeURIComponent(fixtureId)}?voterId=${encodeURIComponent(voter)}`,
  );
  return withCookie(
    NextResponse.json(r.ok && r.body ? r.body : EMPTY),
    voter,
    fresh,
  );
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ fixtureId: string }> },
) {
  const { fixtureId } = await ctx.params;
  const { voter, fresh } = voterFrom(req);
  let choice: string | undefined;
  try {
    choice = (await req.json())?.choice;
  } catch {
    choice = undefined;
  }
  const r = await backendJson<PredictionResult>(
    `/api/v1/predictions/fixtures/${encodeURIComponent(fixtureId)}`,
    { method: "POST", body: JSON.stringify({ voterId: voter, choice }) },
  );
  return withCookie(
    NextResponse.json(r.ok && r.body ? r.body : EMPTY, {
      status: r.ok ? 200 : r.status || 400,
    }),
    voter,
    fresh,
  );
}
