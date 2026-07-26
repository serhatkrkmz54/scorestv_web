import { NextResponse } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

// Muhabir genel görünümü — atanmış ligler + başvuru geçmişi.
export async function GET() {
  const r = await authorizedBackendJson<unknown>("/api/v1/reporter/me");
  if (r.unauthorized) {
    return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? { message: "Alınamadı." }, { status: r.status });
  }
  return NextResponse.json(r.body);
}
