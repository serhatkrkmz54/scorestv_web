"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { detectPlatform, isBot, type Platform } from "@/lib/platform";
import { APP_LANDING_URL } from "@/lib/store-links";
import { Logo } from "@/components/shell/Logo";

// Mobil web'de (yalniz iOS/Android tarayici) anasayfada cikan, kapatilabilir
// modal popup (alttan cikan bottom-sheet). Butona basinca scorestv.app'e gider
// (orada cihaza gore App Store / Play'e yonlendirilir). Kapatilinca localStorage'a
// yazilir -> tekrar cikmaz. Botlara ve masaustune gosterilmez.
const DISMISS_KEY = "stv_app_popup_dismissed";

export function AppInstallPopup() {
  const { lang } = useLang();
  const pathname = usePathname();
  const [os, setOs] = useState<Platform | null>(null);
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* storage yok */
    }
    const ua = navigator.userAgent;
    if (isBot(ua)) return;
    const p = detectPlatform(ua);
    if (p !== "ios" && p !== "android") return;
    setOs(p);
    setVisible(true);
    // Kisa gecikme + iki fazli state -> giris animasyonu (fade + slide-up).
    const t = window.setTimeout(() => setShown(true), 350);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!visible || !os) return null;
  const tr = lang === "tr";

  const close = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* yoksay */
    }
    setShown(false);
    window.setTimeout(() => setVisible(false), 220);
  };

  const ctaLabel =
    os === "ios"
      ? tr
        ? "App Store'dan İndir"
        : "Download on the App Store"
      : tr
        ? "Google Play'den İndir"
        : "Get it on Google Play";

  return (
    <div
      className={`app-popup-overlay${shown ? " is-shown" : ""}`}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={tr ? "Uygulamayı indir" : "Get the app"}
    >
      <div className="app-popup-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="app-popup-close"
          onClick={close}
          aria-label={tr ? "Kapat" : "Close"}
        >
          ×
        </button>

        <div className="app-popup-logo">
          <Logo h={36} />
        </div>

        <h3 className="app-popup-title">
          {tr ? "Uygulamada çok daha iyi" : "Way better on the app"}
        </h3>
        <p className="app-popup-sub">
          {tr
            ? "Canlı skor, anlık gol bildirimleri ve daha fazlası."
            : "Live scores, instant goal alerts and more."}
        </p>

        <a
          href={APP_LANDING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="app-popup-cta"
          onClick={close}
        >
          {os === "ios" ? <AppleIcon /> : <PlayIcon />}
          <span>{ctaLabel}</span>
        </a>

        <button type="button" className="app-popup-later" onClick={close}>
          {tr ? "Tarayıcıda devam et" : "Continue in browser"}
        </button>
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.36 12.9c-.02-2.13 1.74-3.15 1.82-3.2-.99-1.45-2.54-1.65-3.09-1.67-1.32-.13-2.57.77-3.24.77-.66 0-1.7-.75-2.79-.73-1.44.02-2.76.83-3.5 2.11-1.49 2.59-.38 6.42 1.07 8.52.71 1.03 1.56 2.19 2.67 2.15 1.07-.04 1.48-.69 2.77-.69 1.29 0 1.66.69 2.79.67 1.15-.02 1.88-1.05 2.59-2.08.81-1.19 1.15-2.34 1.17-2.4-.03-.01-2.24-.86-2.26-3.42zM14.2 6.6c.59-.72.99-1.71.88-2.7-.85.03-1.88.57-2.49 1.28-.55.63-1.03 1.64-.9 2.61.95.07 1.92-.48 2.51-1.19z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5v19a1 1 0 0 0 1.5.87l16-9.5a1 1 0 0 0 0-1.74l-16-9.5A1 1 0 0 0 4 2.5z" />
    </svg>
  );
}
