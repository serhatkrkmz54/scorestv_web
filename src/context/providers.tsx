"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-context";
import { LangProvider } from "./lang-context";
import { AuthProvider } from "./auth-context";
import { FavoritesProvider } from "./favorites-context";
import { NotifPrefsProvider } from "./notif-prefs-context";
import { Header } from "@/components/shell/Header";
import { AuthModal } from "@/components/auth/AuthModal";
import { NotificationsEngine } from "@/components/home/NotificationsEngine";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <FavoritesProvider>
            <NotifPrefsProvider>
              <div className="app">
                <Header />
                <main>{children}</main>
              </div>
              <AuthModal />
              <NotificationsEngine />
            </NotifPrefsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
