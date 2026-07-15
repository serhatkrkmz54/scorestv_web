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
          {os === "ios" ? <AppleIcon /> : <AndroidIcon />}
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

function AndroidIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
    </svg>
  );
}
