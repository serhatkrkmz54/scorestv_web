import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { headers, cookies } from "next/headers";
import type { Lang } from "@/i18n/auth-strings";
import "./globals.css";
import { Providers } from "@/context/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";
const SITE_DESC =
  "Futbol, basketbol, tenis ve voleybol canlı skorları, puan durumları, istatistikler ve daha fazlası.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ScoresTV — Canlı Skor & İstatistik",
  description: SITE_DESC,
  applicationName: "ScoresTV",
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
};

// Ulkeye gore varsayilan dil — Cloudflare CF-IPCountry header'indan.
// TR ve AZ -> Turkce; diger tum ulkeler -> Ingilizce.
function geoDefaultLang(country: string | null | undefined): Lang {
  const c = (country ?? "").toUpperCase();
  return c === "TR" || c === "AZ" ? "tr" : "en";
}

// Tema/dil "flash" onleyici. Dil icin localStorage tercihi varsa onu, yoksa
// sunucunun ulkeye gore belirledigi `fallback` dilini kullanir.
const noFlash = (fallback: Lang) =>
  `(function(){try{var t=localStorage.getItem('stv_theme');var c=t==='light'?'theme-light':'theme-dark';var e=document.documentElement;e.classList.remove('theme-dark','theme-light');e.classList.add(c);var l=localStorage.getItem('stv_lang');e.lang=(l==='tr'||l==='en')?l:'${fallback}';}catch(_){document.documentElement.lang='${fallback}';}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Baslangic dili onceligi: kullanicinin kayitli tercihi (cookie) >
  // ulkeye gore (CF-IPCountry) > en.
  const [hdrs, cks] = await Promise.all([headers(), cookies()]);
  const saved = cks.get("stv_lang")?.value;
  const initialLang: Lang =
    saved === "tr" || saved === "en"
      ? saved
      : geoDefaultLang(hdrs.get("cf-ipcountry"));

  return (
    <html lang={initialLang} className={`theme-dark ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>
        <Script id="stv-no-flash" strategy="beforeInteractive">
          {noFlash(initialLang)}
        </Script>
        <Providers initialLang={initialLang}>{children}</Providers>
      </body>
    </html>
  );
}
