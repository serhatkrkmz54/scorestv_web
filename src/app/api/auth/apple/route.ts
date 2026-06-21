import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";
import { setAuthCookies } from "@/lib/auth-cookies";
import type { AuthResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  let payload: {
    identityToken?: string;
    name?: string;
    birthDate?: string;
    country?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  if (!payload.identityToken) {
    return NextResponse.json({ message: "identityToken eksik." }, { status: 400 });
  }

  const r = await backendJson<AuthResponse>("/api/v1/auth/apple", {
    method: "POST",
    body: JSON.stringify({
      identityToken: payload.identityToken,
      name: payload.name ?? null,
      birthDate: payload.birthDate ?? null,
      country: payload.country ?? null,
    }),
  });

  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Sunucuya ulaşılamıyor." },
      { status: r.status },
    );
  }

  await setAuthCookies(r.body.accessToken, r.body.refreshToken, r.body.expiresIn, true);
  return NextResponse.json({ user: r.body.user });
}
