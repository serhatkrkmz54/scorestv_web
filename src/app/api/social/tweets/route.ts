import { NextResponse } from "next/server";
import { backendJson } from "@/lib/backend";

// Sag ray tweet akisi — backend bellek cache'inden okur (SocialData'ya istek YOK).
// Backend kapali/bos ise [] doner; TwitterFeed bolumu gizler.
export async function GET() {
  const r = await backendJson<unknown[]>(`/api/v1/social/tweets`, { method: "GET" });
  if (!r.ok || !Array.isArray(r.body)) {
    return NextResponse.json([], { status: 200 });
  }
  return NextResponse.json(r.body);
}
