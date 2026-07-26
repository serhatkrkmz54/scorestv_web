import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

// Muhabirlik başvurusu gönder.
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }
  const r = await authorizedBackendJson<unknown>("/api/v1/reporter/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (r.unauthorized) {
    return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(r.body ?? { message: "Gönderilemedi." }, { status: r.status });
  }
  return NextResponse.json(r.body, { status: 201 });
}
