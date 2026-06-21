import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import type { Lang } from "@/i18n/auth-strings";
import { HOME_META } from "@/lib/seo";
import { resolveLang } from "@/lib/lang-server";
import "./globals.css";
import { Providers } from "@/context/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";

// Google Analytics 4 — Measurement ID. .env'e tasinabilir; sabit de calisir.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-GS488DD8KS";

export async function generateMetadata(): Promise<Metadata> {
  const m = HOME_META[await resolveLang()];
  return {
    metadataBase: new URL(SITE_URL),
    title: m.title,
    description: m.description,
    applicationName: "Scores TV",
    openGraph: {
      type: "website",
      siteName: "Scores TV",
      title: m.title,
      description: m.description,
      url: SITE_URL,
      locale: m.locale,
      images: [
        { url: "/og-image.png", width: 1200, height: 630, alt: "Scores TV" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: ["/og-image.png"],
    },
  };
}

// Tema/dil "flash" onleyici.
const noFlash = (fallback: Lang) =>
  `(function(){try{var t=localStorage.getItem('stv_theme');var c=t==='light'?'theme-light':'theme-dark';var e=document.documentElement;e.classList.remove('theme-dark','theme-light');e.classList.add(c);var l=localStorage.getItem('stv_lang');e.lang=(l==='tr'||l==='en')?l:'${fallback}';}catch(_){document.documentElement.lang='${fallback}';}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLang = await resolveLang();
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

        {/* Google Analytics (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>

        <Providers initialLang={initialLang}>{children}</Providers>
      </body>
    </html>
  );
}
