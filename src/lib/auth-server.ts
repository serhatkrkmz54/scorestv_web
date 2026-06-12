import "server-only";
import { backendJson } from "./backend";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "./auth-cookies";
import type { AppUser, AuthResponse } from "./types";

/**
 * Geçerli oturumun kullanıcısını çözer.
 * access token geçerliyse /me döner; 401 ise refresh dener ve çerezleri tazeler.
 */
export async function resolveUser(): Promise<AppUser | null> {
  const accessToken = await getAccessToken();
  if (accessToken) {
    const r = await backendJson<AppUser>("/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (r.ok && r.body) return r.body;
  }

  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const rr = await backendJson<AuthResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  if (!rr.ok || !rr.body) {
    await clearAuthCookies();
    return null;
  }
  await setAuthCookies(rr.body.accessToken, rr.body.refreshToken, rr.body.expiresIn, true);
  return rr.body.user;
}
