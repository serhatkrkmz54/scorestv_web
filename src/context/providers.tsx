"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-context";
import { LangProvider } from "./lang-context";
import { AuthProvider } from "./auth-context";
import { FavoritesProvider } from "./favorites-context";
import { NotifPrefsProvider } from "./notif-prefs-context";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { Subnav } from "@/components/home/Subnav";
import { AuthModal } from "@/components/auth/AuthModal";
import { NotificationsEngine } from "@/components/home/NotificationsEngine";
import { MobileNavProvider, MobileNavDrawer } from "@/components/shell/MobileNav";
import { MobileNavContent } from "@/components/shell/MobileNavContent";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <FavoritesProvider>
            <NotifPrefsProvider>
              <MobileNavProvider>
                <div className="app">
                  <Header />
                  <Subnav />
                  <main>{children}</main>
                  <Footer />
                </div>
                <MobileNavDrawerWithContent />
                <AuthModal />
                <NotificationsEngine />
              </MobileNavProvider>
            </NotifPrefsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

function MobileNavDrawerWithContent() {
  return (
    <MobileNavDrawer title="Menü">
      <MobileNavContent />
    </MobileNavDrawer>
  );
}
