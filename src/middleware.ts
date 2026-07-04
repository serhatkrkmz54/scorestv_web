import { NextResponse, type NextRequest } from "next/server";

// Kendi sitemizin origin'leri (CSRF Origin kontrolü için). www + apex + env.
const ALLOWED_ORIGINS = new Set<string>(
  [
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://scorestv.com",
    "https://www.scorestv.com",
  ].filter(Boolean) as string[],
);
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// Meşru cross-origin POST (Apple Android form_post callback) — muaf.
const CSRF_EXEMPT = ["/api/auth/apple/callback"];

function originAllowed(value: string | null): boolean {
  if (!value) return false;
  try {
    return ALLOWED_ORIGINS.has(new URL(value).origin);
  } catch {
    return false;
  }
}

// CSRF savunma-derinliği (yalnız prod): mutasyon (POST/PUT/PATCH/DELETE) BFF
// isteklerinde Origin (yoksa Referer) kendi sitemizle eşleşmeli. Cookie-tabanlı
// auth'a SameSite=Lax'in üstüne ek katman. Dev'de kapalı (localhost'u bozmasın).
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    process.env.NODE_ENV === "production" &&
    pathname.startsWith("/api/") &&
    MUTATING.has(req.method) &&
    !CSRF_EXEMPT.some((p) => pathname.startsWith(p))
  ) {
    const origin = req.headers.get("origin");
    const ok = origin
      ? originAllowed(origin)
      : originAllowed(req.headers.get("referer"));
    if (!ok) {
      return NextResponse.json(
        { error: "Geçersiz istek kaynağı." },
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Statik/iç yolları atla; API dahil (CSRF kontrolü buradan geçsin).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
