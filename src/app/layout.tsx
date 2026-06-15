import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/context/providers";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScoresTV — Canlı Skor & İstatistik",
  description:
    "Futbol, basketbol, tenis ve voleybol canlı skorları, puan durumları, istatistikler ve daha fazlası.",
  // Favicon: src/app/favicon.ico (Next convention). Override KALDIRILDI —
  // Next dosyayi hash'li servis eder (favicon.ico?<hash>), boylece favicon
  // degisince URL degisir ve tarayici/CDN cache'i otomatik kirilir.
};

// Tema/dil "flash" önleyici: ilk boyamadan önce localStorage'tan oku.
const noFlash = `(function(){try{var t=localStorage.getItem('stv_theme');var c=t==='light'?'theme-light':'theme-dark';var e=document.documentElement;e.classList.remove('theme-dark','theme-light');e.classList.add(c);var l=localStorage.getItem('stv_lang');if(l==='tr'||l==='en')e.lang=l;}catch(_){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`theme-dark ${rajdhani.variable}`} suppressHydrationWarning>
      <head>
        {/* Elle <head> render edildiginde Next.js otomatik viewport/charset
            meta'larini EKLEMEZ — bu yuzden acikca yaziyoruz. Viewport olmadan
            gercek telefonlar sayfayi ~980px masaustu genisliginde render edip
            kuculttuyor; responsive breakpoint'ler tetiklenmiyor (hamburger
            cikmiyor). */}
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>
        {/* Tema/dil flash onleyici. next/script beforeInteractive: hydration ve
            ilk boyamadan once calisir; ham <script> gibi React'in "script in
            component" uyarisini tetiklemez. Inline script icin id zorunlu. */}
        <Script id="stv-no-flash" strategy="beforeInteractive">
          {noFlash}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
