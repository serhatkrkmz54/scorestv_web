import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import { setAuthCookies } from "@/lib/auth-cookies";
import type { AuthResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  let payload: { email?: string; password?: string; rememberMe?: boolean };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const r = await backendJson<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });

  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Sunucuya ulaşılamıyor." },
      { status: r.status },
    );
  }

  await setAuthCookies(
    r.body.accessToken,
    r.body.refreshToken,
    r.body.expiresIn,
    Boolean(payload.rememberMe),
  );
  return NextResponse.json({ user: r.body.user });
}
