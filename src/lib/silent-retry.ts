"use client";

import { useEffect, useRef } from "react";

/**
 * Genel amacli sessiz retry hook'u.
 *
 * Backend kapali / cold-start asamasinda olabilir. Bu hook:
 *  - {@link fetcher}'i {@link backoffMs} planina gore tekrar tekrar cagirir
 *  - {@link isDone} true donerse zinciri durdurur
 *  - Window `online` veya tab `visibilitychange` (visible) event'lerinde
 *    schedule'u beklemeden HEMEN bir retry tetikler (kullanici sekmeye
 *    geri dondugunde / wifi geri geldiginde anlik kurtarma)
 *  - Component unmount oldugunda timer + abort halinde temizlenir
 *
 * Cache control: caller `fetcher` icinde `cache: "no-store"` kullanmali.
 *
 * @example
 * useSilentRetry({
 *   enabled: !data,
 *   fetcher: async () => {
 *     const r = await fetch("/api/foo", { cache: "no-store" });
 *     if (!r.ok) return null;
 *     return await r.json();
 *   },
 *   onSuccess: (data) => setData(data),
 *   isDone: () => data != null,
 * });
 */
export function useSilentRetry<T>(opts: {
  /** false ise hook hicbir sey yapmaz (zaten data var, vb.) */
  enabled: boolean;
  /** Veri cekici. Null/undefined dondururse "henuz hazir degil" sayilir, retry devam eder. */
  fetcher: (signal: AbortSignal) => Promise<T | null>;
  /** Basarili data alindiginda cagrilir. */
  onSuccess: (data: T) => void;
  /** Caller'a "data var, durdur" demek icin. Her tick'te kontrol edilir. */
  isDone?: () => boolean;
  /** Backoff plani — son eleman tekrar tekrar kullanilir (cap). Default: 1/2/4/8/15s. */
  backoffMs?: readonly number[];
}): void {
  const { enabled, fetcher, onSuccess, isDone, backoffMs } = opts;

  // Latest callbacks/state'i stale closure olmadan effect'e tasimak icin ref.
  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const isDoneRef = useRef(isDone);
  useEffect(() => {
    fetcherRef.current = fetcher;
    onSuccessRef.current = onSuccess;
    isDoneRef.current = isDone;
  });

  useEffect(() => {
    if (!enabled) return;
    const schedule = backoffMs ?? [1000, 2000, 4000, 8000, 15000];

    let active = true;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let ctrl: AbortController | null = null;

    const tryOnce = async () => {
      if (!active) return;
      if (isDoneRef.current?.()) return;
      // Bekleyen fetch varsa iptal — yeni tetiklemenin onune gecsin.
      if (ctrl) ctrl.abort();
      ctrl = new AbortController();
      const mySignal = ctrl.signal;
      try {
        const data = await fetcherRef.current(mySignal);
        if (!active || mySignal.aborted) return;
        if (data != null) {
          onSuccessRef.current(data);
          if (isDoneRef.current?.()) return;
        }
      } catch {
        // Sessiz — schedule asagida zaten devreye girer.
      }
      // Hala done degilse sonraki retry'i planla.
      if (!active) return;
      if (isDoneRef.current?.()) return;
      const delay = schedule[Math.min(attempt, schedule.length - 1)];
      attempt++;
      timer = setTimeout(tryOnce, delay);
    };

    // Kullanici sekmeye donunce / internet geri gelince HEMEN retry — backoff
    // beklemeden. Bu, "backend ayaga kalkti ama 15s'lik next-retry'i bekliyoruz"
    // senaryosunu kestiriyor.
    const fastKick = () => {
      if (!active) return;
      if (isDoneRef.current?.()) return;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      attempt = 0; // Backoff'u sifirla — taze deneme.
      void tryOnce();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") fastKick();
    };
    const onOnline = () => fastKick();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    void tryOnce();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      if (ctrl) ctrl.abort();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [enabled, backoffMs]);
}
