"use client";

// Google Identity Services (GIS) — ID token (credential) akışı.
// Backend /api/v1/auth/google `idToken` bekler; GIS callback'i tam bunu verir.

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface GisCredentialResponse {
  credential: string;
}
interface GisIdApi {
  initialize(config: {
    client_id: string;
    callback: (resp: GisCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  prompt(): void;
}
interface GisWindow {
  google?: { accounts?: { id?: GisIdApi } };
}

let scriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as GisWindow;
  if (w.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = "https://accounts.google.com/gsi/client";
    el.async = true;
    el.defer = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("GIS script load failed"));
    document.head.appendChild(el);
  });
  return scriptPromise;
}

/**
 * Google One Tap akışını tetikler. Başarılı olursa onCredential(idToken) çağrılır.
 * client id yapılandırılmadıysa false döner.
 */
export async function triggerGoogleSignIn(
  onCredential: (idToken: string) => void,
): Promise<boolean> {
  if (!GOOGLE_CLIENT_ID) return false;
  await loadGisScript();
  const w = window as unknown as GisWindow;
  const id = w.google?.accounts?.id;
  if (!id) return false;

  id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (resp) => {
      if (resp?.credential) onCredential(resp.credential);
    },
    cancel_on_tap_outside: true,
  });
  id.prompt();
  return true;
}
