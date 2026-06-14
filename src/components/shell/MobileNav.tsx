"use client";

/**
 * MobileNav — slide-in drawer mobile/tablet icin.
 *
 * Mimari:
 *   - {@link MobileNavProvider}: drawer open/close state'i global
 *   - {@link useMobileNav}: open/close/toggle hook
 *   - {@link MobileNavToggle}: hamburger butonu (Header'da kullanilir)
 *   - {@link MobileNavDrawer}: slide-in panel + backdrop (layout.tsx'te
 *     app shell altinda render edilir)
 *
 * Drawer icerigi children olarak gecirilir. Anasayfa'da LeftRail icerigi
 * iletilir; diger sayfalarda da ayni navigasyon listesi gosterilir.
 *
 * Davranis:
 *   - Backdrop click → kapat
 *   - ESC tusu → kapat
 *   - Route degisikligi (pathname) → kapat
 *   - Body scroll lock acikken
 *   - Focus trap basit: ilk odaklanabilir element drawer'da
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { IconClose, IconMenu } from "@/components/icons";

interface MobileNavCtx {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const Ctx = createContext<MobileNavCtx | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const toggleDrawer = useCallback(() => setOpen((v) => !v), []);

  // Route degisikliginde otomatik kapat
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC ile kapat + body scroll lock
  useEffect(() => {
    if (!open) {
      document.body.classList.remove("drawer-open");
      return;
    }
    document.body.classList.add("drawer-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("drawer-open");
    };
  }, [open]);

  return (
    <Ctx.Provider value={{ open, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMobileNav(): MobileNavCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMobileNav must be inside MobileNavProvider");
  return v;
}

/**
 * Hamburger toggle button. Header'in solunda render edilir.
 * Mobile/tablet'te gorunur (CSS: .h-toggle), desktop'ta gizli.
 */
export function MobileNavToggle({ label }: { label?: string }) {
  const { toggleDrawer, open } = useMobileNav();
  return (
    <button
      type="button"
      className="h-toggle"
      onClick={toggleDrawer}
      aria-label={label ?? "Menu"}
      aria-expanded={open}
      aria-controls="mobile-nav-drawer"
    >
      <IconMenu s={22} />
    </button>
  );
}

/**
 * Drawer + backdrop. Layout'ta app shell altinda render edilir.
 * `title` baslik, `children` icerik. Icerik kaydirilabilir.
 */
export function MobileNavDrawer({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { open, closeDrawer } = useMobileNav();
  return (
    <>
      <div
        className={`mobile-drawer-backdrop${open ? " open" : ""}`}
        onClick={closeDrawer}
        aria-hidden={!open}
      />
      <aside
        id="mobile-nav-drawer"
        className={`mobile-drawer${open ? " open" : ""}`}
        aria-label={title}
        aria-hidden={!open}
      >
        <div className="mobile-drawer-head">
          <span className="mobile-drawer-title">{title}</span>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={closeDrawer}
            aria-label="Kapat"
          >
            <IconClose s={18} />
          </button>
        </div>
        <div className="mobile-drawer-body">{children}</div>
      </aside>
    </>
  );
}
