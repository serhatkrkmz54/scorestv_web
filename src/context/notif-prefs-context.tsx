"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type NotifEvent = "goal" | "redCard" | "penalty" | "start" | "end";

export interface NotifPrefs {
  goal: boolean;
  redCard: boolean;
  penalty: boolean;
  start: boolean;
  end: boolean;
  sound: boolean;
  push: boolean; // tarayıcı bildirimi (izin verildiyse)
}

const DEFAULT: NotifPrefs = {
  goal: true,
  redCard: true,
  penalty: true,
  start: true,
  end: true,
  sound: true,
  push: false,
};

interface NotifCtxValue {
  prefs: NotifPrefs;
  setPref: (key: keyof NotifPrefs, value: boolean) => void;
  enablePush: () => Promise<boolean>;
}

const NotifCtx = createContext<NotifCtxValue | null>(null);
const STORAGE_KEY = "stv_notif";

export function NotifPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hidrasyonu (kasıtlı)
        setPrefs({ ...DEFAULT, ...(JSON.parse(raw) as Partial<NotifPrefs>) });
      }
    } catch {
      // yok say
    }
  }, []);

  const setPref = useCallback(
    (key: keyof NotifPrefs, value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // yok say
        }
        return next;
      });
    },
    [],
  );

  const enablePush = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    const granted = perm === "granted";
    setPref("push", granted);
    return granted;
  }, [setPref]);

  return (
    <NotifCtx.Provider value={{ prefs, setPref, enablePush }}>{children}</NotifCtx.Provider>
  );
}

export function useNotifPrefs(): NotifCtxValue {
  const ctx = useContext(NotifCtx);
  if (!ctx) throw new Error("useNotifPrefs must be used within NotifPrefsProvider");
  return ctx;
}
