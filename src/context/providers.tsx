"use client";

import type { ReactNode } from "react";
import type { Lang } from "@/i18n/auth-strings";
import { ThemeProvider } from "./theme-context";
import { LangProvider } from "./lang-context";
import { AuthProvider } from "./auth-context";
import { FavoritesProvider } from "./favorites-context";
import { NotifPrefsProvider } from "./notif-prefs-context";
import { SportProvider } from "./sport-context";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { Subnav } from "@/components/home/Subnav";
import { AuthModal } from "@/components/auth/AuthModal";
import { NotificationsEngine } from "@/components/home/NotificationsEngine";
import { MobileNavProvider, MobileNavDrawer } from "@/components/shell/MobileNav";
import { MobileNavContent } from "@/components/shell/MobileNavContent";
import { DynamicSeo } from "@/components/seo/DynamicSeo";

export function Providers({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  return (
    <ThemeProvider>
      <LangProvider initialLang={initialLang}>
        <DynamicSeo />
        <AuthProvider>
          <FavoritesProvider>
            <NotifPrefsProvider>
              <SportProvider>
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
              </SportProvider>
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
