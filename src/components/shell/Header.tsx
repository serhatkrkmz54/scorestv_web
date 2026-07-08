"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { useTheme } from "@/context/theme-context";
import { IconBell, IconMoon, IconSun } from "@/components/icons";
import { UserMenu } from "@/components/auth/UserMenu";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { MobileNavToggle } from "./MobileNav";
import { translatePath } from "@/lib/routes";
import type { Lang } from "@/i18n/auth-strings";

// Dil bayraklari — inline SVG (emoji bayraklar Windows'ta "TR"/"GB" harf
// olarak render edildigi icin kullanilmaz).
function FlagTR() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#E30A17" />
      <circle cx="9.5" cy="8" r="4" fill="#fff" />
      <circle cx="10.9" cy="8" r="3.2" fill="#E30A17" />
      <path
        d="M15,5.9 L15.49,7.33 L17.0,7.35 L15.79,8.26 L16.23,9.70 L15,8.83 L13.77,9.70 L14.21,8.26 L13.0,7.35 L14.51,7.33 Z"
        fill="#fff"
      />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg viewBox="0 0 60 30" aria-hidden="true">
      <clipPath id="gb-cut">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath="url(#gb-cut)"
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export function Header() {
  const { user, loading, openAuth } = useAuth();
  const { lang, setLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const switchLang = (target: Lang) => {
    if (target === lang) return;
    setLang(target);
    // Sunucu bileşenleri (haber listesi, skorlar, meta...) YENİ dille yeniden
    // render edilsin diye: cookie'yi HEMEN yaz (context effect'ini bekleme) ve
    // sayfayı yönlendir/tazele. Aksi halde tek-URL sayfalarda (/haberler gibi)
    // sadece client metinleri değişir, sunucu içeriği eski dilde kalırdı.
    document.cookie = `stv_lang=${target}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax`;
    const next = pathname ? translatePath(pathname, target) : null;
    if (next && next !== pathname) {
      router.push(next); // yol dile göre değişiyorsa (haber/news) oraya git
    } else {
      router.refresh(); // yol aynıysa sunucu içeriğini yeni dille tazele
    }
  };

  return (
    <header className="header">
      <div className="header-in">
        <MobileNavToggle label={lang === "tr" ? "Menüyü aç" : "Open menu"} />

        <Link href="/" className="logo" aria-label="ScoresTV">
          <Logo h={25} />
        </Link>

        <SearchBox />

        <div className="h-actions">
          <button className="h-btn icon" aria-label={lang === "tr" ? "Bildirimler" : "Notifications"}>
            <IconBell s={19} />
          </button>

          <button
            className="h-btn icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Acik tema" : "Koyu tema"}
          >
            {theme === "dark" ? <IconSun s={19} /> : <IconMoon s={19} />}
          </button>

          <div className="seg-toggle lang-flags" role="group" aria-label="Dil / Language">
            <button
              className={lang === "tr" ? "on" : ""}
              onClick={() => switchLang("tr")}
              aria-label="Türkçe"
              title="Türkçe"
            >
              <FlagTR />
            </button>
            <button
              className={lang === "en" ? "on" : ""}
              onClick={() => switchLang("en")}
              aria-label="English"
              title="English"
            >
              <FlagGB />
            </button>
          </div>

          {!loading && user ? (
            <UserMenu user={user} />
          ) : (
            <button className="login-btn" onClick={() => openAuth("signin")}>
              {lang === "tr" ? "Giris" : "Sign in"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
