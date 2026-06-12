"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface FavCtxValue {
  favs: Set<number>;
  has: (id: number) => boolean;
  toggle: (id: number) => void;
  addMany: (ids: number[]) => void;
  removeMany: (ids: number[]) => void;
  hasAll: (ids: number[]) => boolean;
}

const FavCtx = createContext<FavCtxValue | null>(null);
const STORAGE_KEY = "stv_favs";

function persist(set: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // yok say
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favs, setFavs] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hidrasyonu (kasıtlı)
        setFavs(new Set(arr));
      }
    } catch {
      // yok say
    }
  }, []);

  const toggle = useCallback((id: number) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
      return next;
    });
  }, []);

  const addMany = useCallback((ids: number[]) => {
    setFavs((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      persist(next);
      return next;
    });
  }, []);

  const removeMany = useCallback((ids: number[]) => {
    setFavs((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      persist(next);
      return next;
    });
  }, []);

  const has = useCallback((id: number) => favs.has(id), [favs]);
  const hasAll = useCallback(
    (ids: number[]) => ids.length > 0 && ids.every((id) => favs.has(id)),
    [favs],
  );

  return (
    <FavCtx.Provider value={{ favs, has, toggle, addMany, removeMany, hasAll }}>
      {children}
    </FavCtx.Provider>
  );
}

export function useFavorites(): FavCtxValue {
  const ctx = useContext(FavCtx);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
