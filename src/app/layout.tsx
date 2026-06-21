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

// Ulkeye gore varsayilan dil — Cloudflare CF-IPCountry. TR/AZ -> tr, digerleri -> en.
function geoDefaultLang(country: string | null | undefined): Lang {
  const c = (country ?? "").toUpperCase();
  return c === "TR" || c === "AZ" ? "tr" : "en";
}

// Istek basina dili coz: kayitli tercih (cookie) > ulke > en.
async function resolveLang(): Promise<Lang> {
  const [hdrs, cks] = await Promise.all([headers(), cookies()]);
  const saved = cks.get("stv_lang")?.value;
  return saved === "tr" || saved === "en"
    ? saved
    : geoDefaultLang(hdrs.get("cf-ipcountry"));
}

// Dile gore SEO baslik/aciklama (ana sayfa + kendi metadata'si olmayan sayfalar).
const META: Record<Lang, { title: string; description: string; locale: string }> = {
  en: {
    title: "Scores TV | Live Scores, Results, Sports News & Video Highlights",
    description:
      "Follow live scores, match results, fixtures, standings, transfer news and video highlights from football, basketball, tennis and more. Scores TV delivers real-time sports coverage, breaking news and live updates from around the world.",
    locale: "en_US",
  },
  tr: {
    title:
      "Scores TV | Canlı Skor, Spor Haberleri, Maç Sonuçları ve Video Özetler",
    description:
      "Futbol, basketbol, tenis ve tüm spor dallarında canlı skorlar, maç sonuçları, puan durumları, transfer haberleri ve video özetleri. Sporun yeni adresi Scores TV.",
    locale: "tr_TR",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const m = META[await resolveLang()];
  return {
    metadataBase: new URL(SITE_URL),
    title: m.title,
    description: m.description,
    applicationName: "ScoresTV",
    openGraph: {
      type: "website",
      siteName: "ScoresTV",
      title: m.title,
      description: m.description,
      url: SITE_URL,
      locale: m.locale,
      images: [
        { url: "/og-image.png", width: 1200, height: 630, alt: "ScoresTV" },
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

// Tema/dil "flash" onleyici. Dil icin localStorage tercihi varsa onu, yoksa
// sunucunun ulkeye gore belirledigi `fallback` dilini kullanir.
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
        <Providers initialLang={initialLang}>{children}</Providers>
      </body>
    </html>
  );
}
