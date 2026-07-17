import { NextResponse } from "next/server";
import { backendJson } from "@/lib/backend";
import type { AiPerformance } from "@/lib/ai-performance-types";

/** AI isabet karnesi BFF — backend /api/v1/ai/performance proxy'si (rozet/şerit). */
export async function GET() {
  const r = await backendJson<AiPerformance>("/api/v1/ai/performance");
  if (!r.ok || !r.body) return NextResponse.json(null);
  return NextResponse.json(r.body);
}
