import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";

export async function POST(req: NextRequest) {
  let payload: { token?: string; newPassword?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const r = await backendJson("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: payload.token, newPassword: payload.newPassword }),
  });

  return NextResponse.json(
    r.body ?? { message: "Sunucuya ulaşılamıyor." },
    { status: r.ok ? 200 : r.status },
  );
}
