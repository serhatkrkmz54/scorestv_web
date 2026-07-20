import { NextResponse, type NextRequest } from "next/server";
import { authorizedBackendForm } from "@/lib/auth-server";
import type { AppUser } from "@/lib/types";

// 8 MB — backend ile ayni ust sinir (AvatarService.MAX_BYTES).
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Profil resmi (avatar) yükleme — auth gerektirir.
 * multipart/form-data → alan adi `file`. Backend gorseli kare kirpip
 * 256px JPEG'e cevirir ve guncel kullaniciyi (avatarUrl dolu) doner.
 */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Dosya boş olamaz." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { message: "Görsel en fazla 8 MB olabilir." },
      { status: 400 },
    );
  }
  if (!file.type.toLowerCase().startsWith("image/")) {
    return NextResponse.json(
      { message: "Yalnızca görsel dosyası yükleyebilirsiniz." },
      { status: 400 },
    );
  }

  const out = new FormData();
  out.append("file", file, file.name || "avatar");

  const r = await authorizedBackendForm<AppUser>(
    "/api/v1/auth/me/avatar",
    "POST",
    out,
  );
  if (r.unauthorized) {
    return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Görsel yüklenemedi." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}

/** Profil resmini kaldirir; avatarUrl null olan guncel kullaniciyi doner. */
export async function DELETE() {
  const r = await authorizedBackendForm<AppUser>(
    "/api/v1/auth/me/avatar",
    "DELETE",
  );
  if (r.unauthorized) {
    return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
  }
  if (!r.ok || !r.body) {
    return NextResponse.json(
      r.body ?? { message: "Görsel kaldırılamadı." },
      { status: r.status },
    );
  }
  return NextResponse.json(r.body);
}
