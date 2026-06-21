"use client";

// Sign in with Apple (web) — Apple JS popup akışı.
// AppleID.auth.signIn() bir id_token döndürür; backend /api/v1/auth/apple bunu
// `identityToken` olarak bekler (JWKS ile aud=Service ID doğrular).
//
// clientId = Service ID (com.scorestv.signin), redirectURI = Apple panelinde
// kayıtlı return URL. Popup modunda Apple gerçekte redirect etmez, sonucu
// postMessage ile döndürür; yine de redirectURI kayıtlı bir return URL ile
// birebir eşleşmek zorunda.

export const APPLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "com.scorestv.signin";
export const APPLE_REDIRECT_URI =
  process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ??
  "https://scorestv.com/api/auth/apple/callback";

interface AppleSignInResponse {
  authorization?: { id_token?: string; code?: string; state?: string };
  // `user` yalnız İLK girişte gelir (ad + e-posta); sonraki girişlerde yok.
  user?: { name?: { firstName?: string; lastName?: string }; email?: string };
}
interface AppleIDAuth {
  init(config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state?: string;
    usePopup: boolean;
  }): void;
  signIn(): Promise<AppleSignInResponse>;
}
interface AppleWindow {
  AppleID?: { auth?: AppleIDAuth };
}

export type AppleSignInResult =
  | { status: "ok"; identityToken: string; name: string | null }
  | { status: "canceled" }
  | { status: "unavailable" }
  | { status: "error"; message?: string };

let scriptPromise: Promise<void> | null = null;

function loadAppleScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as AppleWindow;
  if (w.AppleID?.auth) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    el.async = true;
    el.defer = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("Apple JS script load failed"));
    document.head.appendChild(el);
  });
  return scriptPromise;
}

/**
 * Apple popup giriş akışını tetikler. Başarılıysa identityToken (+ ilk girişte
 * ad) döner. İptal/uygun değil/hata durumları ayrıştırılarak döndürülür ki
 * AuthModal iptalde hata göstermesin.
 */
export async function triggerAppleSignIn(): Promise<AppleSignInResult> {
  if (!APPLE_CLIENT_ID) return { status: "unavailable" };
  try {
    await loadAppleScript();
  } catch {
    return { status: "unavailable" };
  }
  const w = window as unknown as AppleWindow;
  const auth = w.AppleID?.auth;
  if (!auth) return { status: "unavailable" };

  auth.init({
    clientId: APPLE_CLIENT_ID,
    scope: "name email",
    redirectURI: APPLE_REDIRECT_URI,
    usePopup: true,
  });

  try {
    const data = await auth.signIn();
    const idToken = data?.authorization?.id_token;
    if (!idToken) return { status: "error" };
    const fn = data?.user?.name?.firstName ?? "";
    const ln = data?.user?.name?.lastName ?? "";
    const name = [fn, ln].filter((p) => p && p.trim()).join(" ").trim();
    return { status: "ok", identityToken: idToken, name: name || null };
  } catch (err) {
    // Apple iptalde { error: 'popup_closed_by_user' } reject eder.
    const code =
      err && typeof err === "object" && "error" in err
        ? String((err as { error?: unknown }).error ?? "")
        : "";
    if (code === "popup_closed_by_user" || code === "user_cancelled_authorize") {
      return { status: "canceled" };
    }
    return { status: "error", message: code || undefined };
  }
}
