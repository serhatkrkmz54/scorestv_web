"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { detectPlatform } from "@/lib/platform";
import { APP_LANDING_URL } from "@/lib/store-links";
import { Logo } from "@/components/shell/Logo";

// Mobil web'de (yalnız iOS/Android tarayıcı) alttan çıkan, kapatılabilir küçük
// "uygulamayı indir" banner'ı. SADECE anasayfada ("/") gösterilir — böylece
// uygulamanın kendi WebView'ında açılan alt sayfalarda görünmez. iOS Safari
// zaten yerel Smart App Banner de gösterir; bu Android için de kapsar.
const DISMISS_KEY = "stv_app_banner_dismissed";

export function AppInstallBanner() {
  const { lang } = useLang();
  const pathname = usePathname();
  const [href, setHref] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* storage yok */
    }
    const p = detectPlatform(navigator.userAgent);
    // Yalniz mobil tarayicida goster; indirme merkezi scorestv.app (orada
    // cihaza gore App Store / Play'e yonlendirilir).
    if (p !== "ios" && p !== "android") return;
    setHref(APP_LANDING_URL);
    setVisible(true);
  }, []);

  if (!visible || !href || pathname !== "/") return null;
  const tr = lang === "tr";

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* yoksay */
    }
    setVisible(false);
  };

  return (
    <div className="app-install-banner" role="dialog" aria-label={tr ? "Uygulamayı indir" : "Get the app"}>
      <button
        type="button"
        className="aib-close"
        onClick={dismiss}
        aria-label={tr ? "Kapat" : "Close"}
      >
        ×
      </button>
      <span className="aib-brand">
        <Logo h={22} />
      </span>
      <span className="aib-tagline">
        {tr ? "Canlı skor & anlık bildirimler" : "Live scores & instant alerts"}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="aib-cta"
        onClick={dismiss}
      >
        {tr ? "İndir" : "Get"}
      </a>
    </div>
  );
}
