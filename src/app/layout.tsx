import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
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
};

// Tema/dil "flash" önleyici: ilk boyamadan önce localStorage'tan oku.
const noFlash = `(function(){try{var t=localStorage.getItem('stv_theme');var c=t==='light'?'theme-light':'theme-dark';var e=document.documentElement;e.classList.remove('theme-dark','theme-light');e.classList.add(c);var l=localStorage.getItem('stv_lang');if(l==='tr'||l==='en')e.lang=l;}catch(_){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`theme-dark ${rajdhani.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
