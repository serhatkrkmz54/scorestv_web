import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendJson, resolveUser } from "@/lib/auth-server";
import type { AppUser } from "@/lib/types";

export async function GET() {
  const user = await resolveUser();
  if (!user) {
    return NextResponse.json({ message: "Oturum yok." }, { status: 401 });
  }
  return NextResponse.json(user);
}

/**
 * Profil güncelleme — auth gerektirir.
 * Backend PUT /api/v1/auth/me  body: { displayName, birthDate, country }
 */
export async function PUT(req: NextRequest) {
  let payload: { displayName?: string; birthDate?: string; country?: string };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const displayName = (payload.displayName ?? "").trim();
  const birthDate = (payload.birthDate ?? "").trim();
  const country = (payload.country ?? "").trim();
  if (!displayName || !birthDate || !country) {
    return NextResponse.json(
      { message: "Ad, doğum tarihi ve ülke zorunlu." },
      { status: 400 },
    );
  }

  const r = await authorizedBackendJson<AppUser>("/api/v1/auth/me", {
    method: "PUT",
    body: JSON.stringify({ displayName, birthDate, country }),
  });

  if (r.unauthorized) {
    return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Profil güncellenemedi." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
