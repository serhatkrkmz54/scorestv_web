import { NextResponse, type NextRequest } from "next/server";
import { getForwardAccessToken } from "@/lib/auth-server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

// Lig logosu yükleme — multipart'ı backend'e aynen aktarır.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = await getForwardAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "Geçersiz dosya." }, { status: 400 });
  }
  try {
    const r = await fetch(
      `${BACKEND}/api/v1/reporter/leagues/${encodeURIComponent(id)}/logo`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form },
    );
    const body = await r.json().catch(() => ({ message: "Yükleme başarısız." }));
    return NextResponse.json(body, { status: r.status });
  } catch {
    return NextResponse.json({ message: "Sunucuya ulaşılamadı." }, { status: 503 });
  }
}
