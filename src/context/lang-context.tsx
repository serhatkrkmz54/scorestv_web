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

export function LangProvider({
  children,
  initialLang = "en",
}: {
  children: ReactNode;
  /** Sunucuda ulkeye gore belirlenen baslangic dili (CF-IPCountry: TR/AZ -> tr,
   *  digerleri -> en). Kullanicinin acik tercihi (URL ?lang / localStorage /
   *  cookie) her zaman bunu ezer. */
  initialLang?: Lang;
}) {
  // Baslangic dili sunucudan (ulke) gelir; kullanici TR/EN toggle'ina basinca
  // tercih localStorage + cookie'ye yazilir, sonraki ziyaretlerde korunur.
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    // Oncelik: URL ?lang= (mobil WebView), > kullanici acik secimi
    // (localStorage > cookie) > sunucudan gelen baslangic dili.
    let next: Lang | null = null;
    try {
      const q = new URLSearchParams(window.location.search).get("lang");
      if (q === "tr" || q === "en") next = q;
    } catch {
      /* URL okunamadi */
    }
    if (!next) {
      const saved =
        (localStorage.getItem(STORAGE_KEY) as Lang | null) ??
        (readCookie(STORAGE_KEY) as Lang | null);
      if (saved === "tr" || saved === "en") next = saved;
    }
    if (next) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL/localStorage hidrasyonu (kasitli)
      setLangState(next);
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
