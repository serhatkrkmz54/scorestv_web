"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSilentRetry } from "@/lib/silent-retry";

/**
 * SSR sirasinda backend down oldugunda goseterilen "loading + auto-retry"
 * shell'i. Detail page'lerin (takim, lig, oyuncu, mac) {@code initial}
 * verisi null+503 ise {@code notFound()} cagirmak yerine bu component
 * render edilir.
 *
 * <h3>Davranis</h3>
 * <ol>
 *  <li>Skeleton + "Sunucu hazirlaniyor..." mesaji gosterilir</li>
 *  <li>Client tarafinda {@code pingUrl}'i {@link useSilentRetry} ile
 *      tekrar tekrar fetch eder (1/2/4/8/15s backoff, max 15s).
 *      Window focus / online'da anlik retry tetiklenir.</li>
 *  <li>Ping 2xx donerse {@code router.refresh()} cagrilir — Next.js
 *      sayfayi SSR'dan yeniden render eder ve dolu sayfa gelir</li>
 *  <li>Ping 404 donerse "Sayfa bulunamadi" mesaji gosterilir
 *      (backend up + gercek 404)</li>
 *  <li>Ping 5xx/network hata olursa retry zinciri devam eder</li>
 * </ol>
 *
 * Cache: ping cagrisi {@code cache: "no-store"}.
 */
export function RetryablePage({
  pingUrl,
  lang = "tr",
}: {
  /** Periyodik olarak HEAD/GET ile pinglenecek backend (BFF) URL'i. */
  pingUrl: string;
  lang?: "tr" | "en";
}) {
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);
  const [recovered, setRecovered] = useState(false);

  // Recovery: ping 2xx olunca SSR'i yeniden tetikle.
  // router.refresh()'i bir kez cagiririz; recovered true sonra retry durur.
  useSilentRetry<true>({
    enabled: !notFound && !recovered,
    isDone: () => notFound || recovered,
    fetcher: async (signal) => {
      try {
        const r = await fetch(pingUrl, { cache: "no-store", signal });
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        if (r.ok) return true; // basari sinyali
      } catch {
        // network — retry edilecek
      }
      return null;
    },
    onSuccess: () => {
      setRecovered(true);
    },
  });

  // recovered true olunca router.refresh — SSR yeniden calissin, dolu sayfa gelsin.
  useEffect(() => {
    if (recovered) router.refresh();
  }, [recovered, router]);

  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  if (notFound) {
    return (
      <div className="retry-shell">
        <div className="retry-shell-inner">
          <h1 className="retry-shell-title">
            {t("Sayfa bulunamadı", "Page not found")}
          </h1>
          <p className="retry-shell-sub">
            {t(
              "Aradığınız içerik mevcut değil veya taşınmış olabilir.",
              "The page you are looking for does not exist or has been moved.",
            )}
          </p>
          <a href={lang === "tr" ? "/" : "/"} className="retry-shell-link">
            {t("Anasayfaya dön", "Back to home")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="retry-shell">
      <div className="retry-shell-inner">
        <div className="retry-shell-spinner" aria-hidden>
          <span /><span /><span />
        </div>
        <h2 className="retry-shell-title">
          {t("Yükleniyor...", "Loading...")}
        </h2>
        <p className="retry-shell-sub">
          {t(
            "Sunucu hazırlanıyor. Veriler hazır olur olmaz sayfa otomatik dolacaktır.",
            "Server is warming up. The page will populate automatically once data is ready.",
          )}
        </p>
      </div>
    </div>
  );
}
