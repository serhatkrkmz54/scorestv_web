import { type NextRequest, NextResponse } from "next/server";

/**
 * Android "Sign in with Apple" web-flow callback.
 *
 * Apple, kullanıcı doğrulandıktan sonra (response_mode=form_post) bu URL'e
 * POST atar. sign_in_with_apple paketinin Android tarafı, sunucunun custom
 * `intent://` şemasıyla uygulamaya geri yönlendirmesini bekler. Biz de gelen
 * form alanlarını (code, id_token, state, user) query string'e çevirip
 * uygulamanın SignInWithAppleCallback activity'sine yönlendiriyoruz.
 *
 *   intent://callback?{params}#Intent;package=com.scorestv.mobile;scheme=signinwithapple;end
 *
 * iOS bu akışı kullanmaz (native); web popup da buraya düşmez (postMessage ile
 * döner). Yani bu route pratikte yalnız Android içindir.
 */

const ANDROID_PACKAGE = "com.scorestv.mobile";

// Yalnız Apple'ın gönderdiği beklenen alanlar intent'e aktarılır — rastgele
// param yansıtmayı (injection) engeller. id_token JWT + user JSON büyük olabilir.
const ALLOWED_FIELDS = new Set(["code", "id_token", "state", "user"]);
const MAX_FIELD_LEN = 8192;

function pickAllowed(entries: Iterable<[string, string]>): URLSearchParams {
  const out = new URLSearchParams();
  for (const [key, value] of entries) {
    if (ALLOWED_FIELDS.has(key) && value.length <= MAX_FIELD_LEN) {
      out.append(key, value);
    }
  }
  return out;
}

function buildIntentRedirect(params: URLSearchParams): NextResponse {
  const intentUrl =
    `intent://callback?${params.toString()}` +
    `#Intent;package=${ANDROID_PACKAGE};scheme=signinwithapple;end`;
  // NextResponse.redirect URL doğrulaması yaptığı için intent:// kabul etmez;
  // Location header'ını elle set ediyoruz (303 See Other).
  return new NextResponse(null, {
    status: 303,
    headers: { Location: intentUrl },
  });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const entries: [string, string][] = [];
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") entries.push([key, value]);
  }
  return buildIntentRedirect(pickAllowed(entries));
}

export async function GET(req: NextRequest) {
  // Bazı durumlarda response_mode=query ile gelebilir — defansif.
  return buildIntentRedirect(pickAllowed(req.nextUrl.searchParams.entries()));
}
