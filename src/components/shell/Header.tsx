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

export function Header() {
  const { user, loading, openAuth } = useAuth();
  const { lang, setLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const switchLang = (target: Lang) => {
    if (target === lang) return;
    setLang(target);
    if (!pathname) return;
    const next = translatePath(pathname, target);
    if (next !== pathname) router.push(next);
  };

  return (
    <header className="header">
      <div className="header-in">
        <MobileNavToggle label={lang === "tr" ? "Menüyü aç" : "Open menu"} />

        <Link href="/" className="logo" aria-label="ScoresTV">
          <Logo h={40} />
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

          <div className="seg-toggle" role="group" aria-label="Dil / Language">
            <button className={lang === "tr" ? "on" : ""} onClick={() => switchLang("tr")}>
              TR
            </button>
            <button className={lang === "en" ? "on" : ""} onClick={() => switchLang("en")}>
              EN
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
