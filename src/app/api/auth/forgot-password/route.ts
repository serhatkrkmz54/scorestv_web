import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";

export async function POST(req: NextRequest) {
  let payload: { email?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const r = await backendJson("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: payload.email }),
  });

  return NextResponse.json(
    r.body ?? { message: "Sunucuya ulaşılamıyor." },
    { status: r.ok ? 200 : r.status },
  );
}
