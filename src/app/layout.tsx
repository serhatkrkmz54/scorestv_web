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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";
const SITE_DESC =
  "Futbol, basketbol, tenis ve voleybol canlı skorları, puan durumları, istatistikler ve daha fazlası.";

export const metadata: Metadata = {
  // metadataBase: OG/canonical gibi RELATIF URL'leri mutlak'a cevirir (Next uyarisini de keser).
  metadataBase: new URL(SITE_URL),
  title: "ScoresTV — Canlı Skor & İstatistik",
  description: SITE_DESC,
  applicationName: "ScoresTV",
  // Sayfaya ozel OG yoksa (anasayfa, statik sayfalar) bu varsayilanlar gecerli.
  // Detay sayfalari (takim/oyuncu/lig/mac) kendi OG'lerini generateMetadata'da ezer.
  openGraph: {
    type: "website",
    siteName: "ScoresTV",
    title: "ScoresTV — Canlı Skor & İstatistik",
    description: SITE_DESC,
    url: SITE_URL,
    locale: "tr_TR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ScoresTV" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScoresTV — Canlı Skor & İstatistik",
    description: SITE_DESC,
    images: ["/og-image.png"],
  },
  // Favicon: src/app/favicon.ico (Next convention). Override KALDIRILDI —
  // Next dosyayi hash'li servis eder (favicon.ico?<hash>), boylece favicon
  // degisince URL degisir ve tarayici/CDN cache'i otomatik kirilir.
};

// Tema/dil "flash" önleyici: ilk boyamadan önce localStorage'tan oku.
// Default dil: EN (her ulkeden gelen yeni ziyaretci EN gorur). Kullanici
// acikca TR sectiyse localStorage/cookie'de durdugu icin sonraki ziyaretlerde
// TR olarak kalir. Boş ise explicit 'en' set edilir — html lang attribute
// SSR'de de "en" tutarli olsun diye.
const noFlash = `(function(){try{var t=localStorage.getItem('stv_theme');var c=t==='light'?'theme-light':'theme-dark';var e=document.documentElement;e.classList.remove('theme-dark','theme-light');e.classList.add(c);var l=localStorage.getItem('stv_lang');e.lang=(l==='tr'||l==='en')?l:'en';}catch(_){document.documentElement.lang='en';}})();`;

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
