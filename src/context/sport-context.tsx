"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Sport } from "@/lib/sports";

interface SportCtxValue {
  sport: Sport;
  setSport: (s: Sport) => void;
}

const SportCtx = createContext<SportCtxValue | null>(null);

// Secili sporu (futbol/basketbol/voleybol) global tutar. Subnav tab'lari
// degistirir; anasayfa fikstur feed'i buna gore ilgili spor verisini ceker.
// Futbol varsayilan — futbol davranisi degismeden kalir.
export function SportProvider({ children }: { children: ReactNode }) {
  const [sport, setSport] = useState<Sport>("football");
  return (
    <SportCtx.Provider value={{ sport, setSport }}>
      {children}
    </SportCtx.Provider>
  );
}

export function useSport(): SportCtxValue {
  const ctx = useContext(SportCtx);
  if (!ctx) throw new Error("useSport must be used within SportProvider");
  return ctx;
}

// SportProvider yoksa null doner; global bilesenler (Subnav) guvenli okur.
export function useSportOptional(): SportCtxValue | null {
  return useContext(SportCtx);
}
