"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppUser,
  BackendError,
  LoginInput,
  RegisterInput,
} from "@/lib/types";

export type AuthMode = "signin" | "signup";

export interface AuthActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  /** Google ile ilk kayit — backend dogum tarihi + ulke istiyor. AuthModal
   *  bu flag'i gorunce normal form yerine tamamlama paneli gosterir. */
  needsCompletion?: boolean;
}

interface AuthCtxValue {
  user: AppUser | null;
  loading: boolean;
  authOpen: boolean;
  authMode: AuthMode;
  /**
   * Google ilk kayit akisi aktif mi? Backend birthDate + country istedi,
   * idToken auth-context'te cache'leniyor. AuthModal bu flag'i izleyip
   * tamamlama panelini acar.
   */
  needsGoogleCompletion: boolean;
  /** Apple ilk kayit akisi aktif mi? Google ile birebir ayni desen. */
  needsAppleCompletion: boolean;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  setAuthMode: (mode: AuthMode) => void;
  login: (input: LoginInput) => Promise<AuthActionResult>;
  register: (input: RegisterInput) => Promise<AuthActionResult>;
  loginWithGoogle: (idToken: string) => Promise<AuthActionResult>;
  completeGoogleSignUp: (
    input: { birthDate: string; country: string },
  ) => Promise<AuthActionResult>;
  cancelGoogleCompletion: () => void;
  loginWithApple: (
    identityToken: string,
    name: string | null,
  ) => Promise<AuthActionResult>;
  completeAppleSignUp: (
    input: { birthDate: string; country: string },
  ) => Promise<AuthActionResult>;
  cancelAppleCompletion: () => void;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthActionResult>;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthCtxValue | null>(null);

/** Backend hata gövdesinden kullanıcıya gösterilecek mesajı çıkarır. */
function extractError(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const e = body as BackendError;
    if (e.errors) {
      const first = Object.values(e.errors)[0];
      if (first) return first;
    }
    if (e.message) return e.message;
  }
  return fallback;
}

/**
 * Backend "Google ile ilk kayit icin dogum tarihi ve ulke gereklidir"
 * mesajini tanir. AuthService.java'da donen mesaj ile esliyor.
 */
function isGoogleProfileMissing(status: number, body: unknown): boolean {
  if (status !== 400) return false;
  if (!body || typeof body !== "object") return false;
  const msg = (body as { message?: string }).message ?? "";
  const lower = msg.toLowerCase();
  return (
    msg.includes("ilk kayıt") ||
    lower.includes("first registration") ||
    (msg.includes("birthDate") && msg.includes("country")) ||
    (msg.toLowerCase().includes("doğum") && msg.toLowerCase().includes("ülke"))
  );
}

async function postJson(url: string, payload?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [needsGoogleCompletion, setNeedsGoogleCompletion] = useState(false);
  const [needsAppleCompletion, setNeedsAppleCompletion] = useState(false);

  /**
   * Google ile gelen idToken — backend ilk kayitta birthDate+country isteyince
   * burada cache'liyoruz ki kullanici 2 alani doldurup tekrar Google popup
   * acmadan tamamla diyebilsin. Ref kullaniyoruz cunku state degisikligi
   * gereksiz re-render yaratir; bu deger sadece submit aninda okunur.
   */
  const pendingIdTokenRef = useRef<string | null>(null);

  /** Apple identityToken + adı — ilk kayıt tamamlamada tekrar Apple popup'ı
   *  açmamak için. (Apple adı yalnız ilk girişte gelir, kaybetmeyelim.) */
  const pendingAppleTokenRef = useRef<string | null>(null);
  const pendingAppleNameRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        setUser((await res.json()) as AppUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const openAuth = useCallback((mode: AuthMode = "signin") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    // Modal kapanirken tamamlama state'ini de temizle (sonraki acmada temiz).
    setNeedsGoogleCompletion(false);
    pendingIdTokenRef.current = null;
    setNeedsAppleCompletion(false);
    pendingAppleTokenRef.current = null;
    pendingAppleNameRef.current = null;
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<AuthActionResult> => {
    const { res, body } = await postJson("/api/auth/login", input);
    if (res.ok && body) {
      setUser((body as { user: AppUser }).user);
      setAuthOpen(false);
      return { ok: true };
    }
    return { ok: false, error: extractError(body, "Giriş başarısız.") };
  }, []);

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthActionResult> => {
      const { res, body } = await postJson("/api/auth/register", input);
      if (res.ok && body) {
        setUser((body as { user: AppUser }).user);
        setAuthOpen(false);
        return { ok: true };
      }
      return { ok: false, error: extractError(body, "Kayıt başarısız.") };
    },
    [],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<AuthActionResult> => {
      const { res, body } = await postJson("/api/auth/google", { idToken });
      if (res.ok && body) {
        setUser((body as { user: AppUser }).user);
        setAuthOpen(false);
        return { ok: true };
      }
      // Yeni Google kaydi — backend birthDate+country istiyor. idToken'i
      // cache'leyip tamamlama paneline yonlendir; kullanici aynisini girip
      // 2 alanla tekrar gonderecek.
      if (isGoogleProfileMissing(res.status, body)) {
        pendingIdTokenRef.current = idToken;
        setNeedsGoogleCompletion(true);
        return { ok: false, needsCompletion: true };
      }
      return { ok: false, error: extractError(body, "Google girişi başarısız.") };
    },
    [],
  );

  const completeGoogleSignUp = useCallback(
    async (
      input: { birthDate: string; country: string },
    ): Promise<AuthActionResult> => {
      const idToken = pendingIdTokenRef.current;
      if (!idToken) {
        // Cache dustu — kullaniciyi yeniden Google ile basa donmeye yonlendir.
        setNeedsGoogleCompletion(false);
        return {
          ok: false,
          error: "Oturum süresi doldu, lütfen tekrar deneyin.",
        };
      }
      const { res, body } = await postJson("/api/auth/google", {
        idToken,
        birthDate: input.birthDate,
        country: input.country,
      });
      if (res.ok && body) {
        setUser((body as { user: AppUser }).user);
        setAuthOpen(false);
        setNeedsGoogleCompletion(false);
        pendingIdTokenRef.current = null;
        return { ok: true };
      }
      return {
        ok: false,
        error: extractError(body, "Google girişi başarısız."),
      };
    },
    [],
  );

  const cancelGoogleCompletion = useCallback(() => {
    pendingIdTokenRef.current = null;
    setNeedsGoogleCompletion(false);
  }, []);

  const loginWithApple = useCallback(
    async (
      identityToken: string,
      name: string | null,
    ): Promise<AuthActionResult> => {
      const { res, body } = await postJson("/api/auth/apple", {
        identityToken,
        name,
      });
      if (res.ok && body) {
        setUser((body as { user: AppUser }).user);
        setAuthOpen(false);
        return { ok: true };
      }
      // Yeni Apple kaydi — backend birthDate+country istiyor. Token + adi
      // cache'leyip tamamlama paneline yonlendir.
      if (isGoogleProfileMissing(res.status, body)) {
        pendingAppleTokenRef.current = identityToken;
        pendingAppleNameRef.current = name;
        setNeedsAppleCompletion(true);
        return { ok: false, needsCompletion: true };
      }
      return { ok: false, error: extractError(body, "Apple girişi başarısız.") };
    },
    [],
  );

  const completeAppleSignUp = useCallback(
    async (
      input: { birthDate: string; country: string },
    ): Promise<AuthActionResult> => {
      const identityToken = pendingAppleTokenRef.current;
      if (!identityToken) {
        setNeedsAppleCompletion(false);
        return {
          ok: false,
          error: "Oturum süresi doldu, lütfen tekrar deneyin.",
        };
      }
      const { res, body } = await postJson("/api/auth/apple", {
        identityToken,
        name: pendingAppleNameRef.current,
        birthDate: input.birthDate,
        country: input.country,
      });
      if (res.ok && body) {
        setUser((body as { user: AppUser }).user);
        setAuthOpen(false);
        setNeedsAppleCompletion(false);
        pendingAppleTokenRef.current = null;
        pendingAppleNameRef.current = null;
        return { ok: true };
      }
      return {
        ok: false,
        error: extractError(body, "Apple girişi başarısız."),
      };
    },
    [],
  );

  const cancelAppleCompletion = useCallback(() => {
    pendingAppleTokenRef.current = null;
    pendingAppleNameRef.current = null;
    setNeedsAppleCompletion(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      const { res, body } = await postJson("/api/auth/forgot-password", { email });
      if (res.ok) {
        const msg =
          body && typeof body === "object" && "message" in body
            ? String((body as { message: string }).message)
            : undefined;
        return { ok: true, message: msg };
      }
      return { ok: false, error: extractError(body, "İstek başarısız.") };
    },
    [],
  );

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        authOpen,
        authMode,
        needsGoogleCompletion,
        needsAppleCompletion,
        openAuth,
        closeAuth,
        setAuthMode,
        login,
        register,
        loginWithGoogle,
        completeGoogleSignUp,
        cancelGoogleCompletion,
        loginWithApple,
        completeAppleSignUp,
        cancelAppleCompletion,
        logout,
        forgotPassword,
        refresh,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthCtxValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
