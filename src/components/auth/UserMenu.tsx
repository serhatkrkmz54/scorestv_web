"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { IconBell, IconChevronDown, IconLogout, IconStar, IconUser } from "@/components/icons";
import type { AppUser } from "@/lib/types";

export function UserMenu({ user }: { user: AppUser }) {
  const { logout } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const name = user.displayName || "Üye";
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-pill" onClick={() => setOpen((o) => !o)}>
        <span className="user-av">{initial}</span>
        <span className="user-nm">{name}</span>
        <IconChevronDown s={15} />
      </button>
      {open && (
        <div className="user-drop">
          <Link href="/profil" className="ud-head" onClick={() => setOpen(false)}>
            <span className="user-av big">{initial}</span>
            <div>
              <b>{name}</b>
              <span>{user.email}</span>
            </div>
          </Link>
          <Link href="/profil" className="ud-item" onClick={() => setOpen(false)}>
            <IconUser s={16} /> {t("Profilim", "My Profile")}
          </Link>
          <button className="ud-item">
            <IconStar s={16} /> {t("Favorilerim", "My Favorites")}
          </button>
          <button className="ud-item">
            <IconBell s={16} /> {t("Bildirimler", "Notifications")}
          </button>
          <button
            className="ud-item danger"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            <IconLogout s={16} /> {t("Çıkış Yap", "Sign out")}
          </button>
        </div>
      )}
    </div>
  );
}
