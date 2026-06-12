import "server-only";

const BASE = process.env.BACKEND_URL ?? "http://localhost:8080";

export interface BackendResult<T = unknown> {
  ok: boolean;
  status: number;
  body: T | null;
}

/** Spring backend'e JSON isteği atar; cache yok (canlı veriler). */
export async function backendJson<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<BackendResult<T>> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
  } catch {
    // Backend kapalı / erişilemiyor
    return { ok: false, status: 503, body: null };
  }
  const text = await res.text();
  let body: T | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as T;
    } catch {
      body = text as unknown as T;
    }
  }
  return { ok: res.ok, status: res.status, body };
}
