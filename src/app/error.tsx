"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { useSilentRetry } from "@/lib/silent-retry";

/**
 * Kök hata sınırı — SSR sırasında hata fırlatan sayfalar (özellikle
 * backendUnavailable(): backend down/5xx/zaman aşımı) HTTP 500 ile buraya
 * düşer. RetryablePage ile aynı UX: spinner + backend sağlığını sessizce
 * pingle, ayağa kalkınca reset() ile sayfayı SSR'dan yeniden dene.
 *
 * Sonsuz döngü emniyeti: sayfa hatası backend'den bağımsızsa (health OK ama
 * sayfa yine hata veriyorsa) otomatik reset üst üste tekrarlanabilir —
 * sessionStorage sayacıyla otomatik deneme 3 ile sınırlanır, sonrası manuel
 * "Tekrar dene" butonuna bırakılır.
 */
const MAX_AUTO_RESETS = 3;
const RESET_WINDOW_MS = 120_000;

function takeAutoResetSlot(): boolean {
  try {
    const key = `stv-err-reset:${window.location.pathname}`;
    const raw = sessionStorage.getItem(key);
    const now = Date.now();
    let count = 0;
    if (raw) {
      const [c, ts] = raw.split(":");
      if (now - Number(ts) < RESET_WINDOW_MS) count = Number(c) || 0;
    }
    if (count >= MAX_AUTO_RESETS) return false;
    sessionStorage.setItem(key, `${count + 1}:${now}`);
    return true;
  } catch {
    return true;
  }
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLang();
  const [manual, setManual] = useState(false);
  const doneRef = useRef(false);

  // Hata telemetrisi konsola — prod'da mesaj redakte edilir, digest kalır.
  useEffect(() => {
    console.error("[error-boundary]", error.digest ?? error.message);
  }, [error]);

  // Backend sağlığını backoff'la pingle; ayağa kalkınca bir otomatik deneme
  // hakkı varsa reset() (SSR yeniden çalışır, dolu sayfa gelir).
  useSilentRetry<true>({
    enabled: !manual,
    isDone: () => doneRef.current,
    fetcher: async (signal) => {
      try {
        const r = await fetch("/api/health", { cache: "no-store", signal });
        if (r.ok) return true;
      } catch {
        // network — retry devam
      }
      return null;
    },
    onSuccess: () => {
      doneRef.current = true;
      if (takeAutoResetSlot()) reset();
      else setManual(true);
    },
  });

  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  return (
    <div className="retry-shell">
      <div className="retry-shell-inner">
        {manual ? (
          <>
            <h2 className="retry-shell-title">
              {t("Bir şeyler ters gitti", "Something went wrong")}
            </h2>
            <p className="retry-shell-sub">
              {t(
                "Sayfa şu an yüklenemiyor. Tekrar deneyebilir veya anasayfaya dönebilirsiniz.",
                "The page cannot be loaded right now. You can retry or go back to the home page.",
              )}
            </p>
            <button type="button" className="retry-shell-link" onClick={() => reset()}>
              {t("Tekrar dene", "Try again")}
            </button>
            <Link href="/" className="retry-shell-link">
              {t("Anasayfaya dön", "Back to home")}
            </Link>
          </>
        ) : (
          <>
            <div className="retry-shell-spinner" aria-hidden>
              <span /><span /><span />
            </div>
            <h2 className="retry-shell-title">{t("Yükleniyor...", "Loading...")}</h2>
            <p className="retry-shell-sub">
              {t(
                "Sunucu hazırlanıyor. Veriler hazır olur olmaz sayfa otomatik dolacaktır.",
                "Server is warming up. The page will populate automatically once data is ready.",
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
