"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "@/i18n/auth-strings";

interface LangCtxValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LangCtx = createContext<LangCtxValue | null>(null);
const STORAGE_KEY = "stv_lang";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LangProvider({ children }: { children: ReactNode }) {
  // Varsayilan dil: Ingilizce (her ulke icin). Kullanici TR/EN toggle'ina
  // basinca tercih localStorage + cookie'ye yazilir ve sonraki ziyaretlerde
  // korunur.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    // Oncelik: kullanicinin acik secimi (localStorage > cookie) > varsayilan en
    const saved = (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? (readCookie(STORAGE_KEY) as Lang | null);
    if (saved === "tr" || saved === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage/cookie hidrasyonu (kasitli)
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    writeCookie(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(
    () => setLangState((l) => (l === "tr" ? "en" : "tr")),
    [],
  );

  return (
    <LangCtx.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang(): LangCtxValue {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
