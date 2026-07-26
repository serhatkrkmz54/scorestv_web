import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";

/**
 * Kullanıcı veri katkısı ("Hata bildir") — backend POST /api/v1/contributions.
 * Giriş zorunlu; oturum yoksa 401 (istemci auth modalını açar). Günlük limit
 * backend'de. API'den senkronlanan veriye hiçbir etkisi yok — katkı yalnız
 * inceleme kuyruğuna düşer.
 */
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const r = await authorizedBackendJson<unknown>("/api/v1/contributions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (r.unauthorized) {
    return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Katkı gönderilemedi." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body, { status: 201 });
}
