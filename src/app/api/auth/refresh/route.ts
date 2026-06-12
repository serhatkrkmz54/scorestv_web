import { NextResponse } from "next/server";
import { backendJson } from "@/lib/backend";
import {
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/auth-cookies";
import type { AuthResponse } from "@/lib/types";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ message: "Oturum yok." }, { status: 401 });
  }

  const r = await backendJson<AuthResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (!r.ok || !r.body) {
    await clearAuthCookies();
    return NextResponse.json(
      r.body ?? { message: "Oturum yenilenemedi." },
      { status: r.status },
    );
  }

  await setAuthCookies(r.body.accessToken, r.body.refreshToken, r.body.expiresIn, true);
  return NextResponse.json({ user: r.body.user });
}
