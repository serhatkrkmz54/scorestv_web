import "server-only";
import type { AiPerformance } from "./ai-performance-types";

const BASE = process.env.BACKEND_URL ?? "http://localhost:8080";

/** AI isabet karnesini SSR'de çeker (15 dk ISR cache). Hata → null. */
export async function getAiPerformance(): Promise<AiPerformance | null> {
  try {
    const r = await fetch(`${BASE}/api/v1/ai/performance`, {
      next: { revalidate: 900 },
    });
    if (!r.ok) return null;
    return (await r.json()) as AiPerformance;
  } catch {
    return null;
  }
}
