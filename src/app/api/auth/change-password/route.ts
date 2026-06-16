import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendJson } from "@/lib/auth-server";
import { setAuthCookies } from "@/lib/auth-cookies";
import type { AuthResponse } from "@/lib/types";

/**
 * Şifre değiştirme — auth gerektirir.
 * Backend POST /api/v1/auth/change-password  body: { currentPassword, newPassword }
 * → yeni token çifti döner; çerezleri tazeleriz (refresh token rotasyonu).
 */
export async function POST(req: NextRequest) {
  let payload: { currentPassword?: string; newPassword?: string };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const currentPassword = payload.currentPassword ?? "";
  const newPassword = payload.newPassword ?? "";
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { message: "Mevcut ve yeni şifre zorunlu." },
      { status: 400 },
    );
  }

  const r = await authorizedBackendJson<AuthResponse>(
    "/api/v1/auth/change-password",
    {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    },
  );

  if (r.unauthorized) {
    return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Şifre değiştirilemedi." },
      { status: r.status },
    );
  }

  await setAuthCookies(
    r.body.accessToken,
    r.body.refreshToken,
    r.body.expiresIn,
    true,
  );
  return NextResponse.json({ user: r.body.user });
}
