import "server-only";

const BASE = process.env.BACKEND_URL ?? "http://localhost:8080";

// Backend boğulduğunda isteği sınırsız bekletme: 8sn'de kes. Böylece SSR
// nginx'in 30sn 504'üne asılı kalmaz; sayfa hızla kontrollü hata durumuna
// düşer (Googlebot tarama bütçesi + sunucuda istek yığılması korunur).
const TIMEOUT_MS = 8000;

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
      signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    // Zaman aşımı → 504; bağlantı hatası (backend kapalı) → 503
    const timedOut = e instanceof Error && e.name === "TimeoutError";
    return { ok: false, status: timedOut ? 504 : 503, body: null };
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
