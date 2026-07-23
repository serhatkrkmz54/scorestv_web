import { backendJson } from "@/lib/backend";

// Hafif sağlık ucu — app/error.tsx'in auto-recover ping'i için. Backend'in
// public /actuator/health'ine proxy'ler; gövde döndürmez.
export async function GET() {
  const r = await backendJson("/actuator/health");
  return new Response(null, { status: r.ok ? 204 : 503 });
}
