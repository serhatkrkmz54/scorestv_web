"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { useTheme } from "@/context/theme-context";
import { IconBell, IconMoon, IconSearch, IconSun } from "@/components/icons";
import { UserMenu } from "@/components/auth/UserMenu";
import { Logo } from "./Logo";

export function Header() {
  const { user, loading, openAuth } = useAuth();
  const { lang, setLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-in">
        <Link href="/" className="logo" aria-label="ScoresTV">
          <Logo h={36} />
        </Link>

        <div className="search">
          <span className="s-ico">
            <IconSearch s={18} />
          </span>
          <input
            type="search"
            placeholder={lang === "tr" ? "Takım, lig, oyuncu ara…" : "Search team, league, player…"}
            aria-label="Ara"
          />
          <kbd>/</kbd>
        </div>

        <div className="h-actions">
          <button className="h-btn icon" aria-label={lang === "tr" ? "Bildirimler" : "Notifications"}>
            <IconBell s={19} />
          </button>

          <button
            className="h-btn icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Açık tema" : "Koyu tema"}
          >
            {theme === "dark" ? <IconSun s={19} /> : <IconMoon s={19} />}
          </button>

          <div className="seg-toggle" role="group" aria-label="Dil / Language">
            <button className={lang === "tr" ? "on" : ""} onClick={() => setLang("tr")}>
              TR
            </button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
              EN
            </button>
          </div>

          {!loading && user ? (
            <UserMenu user={user} />
          ) : (
            <button className="login-btn" onClick={() => openAuth("signin")}>
              {lang === "tr" ? "Giriş" : "Sign in"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
