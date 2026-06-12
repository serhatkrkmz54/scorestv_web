"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
}

interface AuthCtxValue {
  user: AppUser | null;
  loading: boolean;
  authOpen: boolean;
  authMode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  setAuthMode: (mode: AuthMode) => void;
  login: (input: LoginInput) => Promise<AuthActionResult>;
  register: (input: RegisterInput) => Promise<AuthActionResult>;
  loginWithGoogle: (idToken: string) => Promise<AuthActionResult>;
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
  const closeAuth = useCallback(() => setAuthOpen(false), []);

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
      return { ok: false, error: extractError(body, "Google girişi başarısız.") };
    },
    [],
  );

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
        openAuth,
        closeAuth,
        setAuthMode,
        login,
        register,
        loginWithGoogle,
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
