"use client";

import { EMPTY_SEARCH, type SearchResponse } from "./search-types";

/**
 * Client-side search fetch — AbortSignal destekli.
 *
 * Caller (SearchBox) her keystroke'da yeni AbortController olusturur ve
 * bir oncekini iptal eder. Boylece kullanici hizli yazinca eski cevaplar
 * ekrana donmez (race-condition fix).
 *
 * Hata durumu (network / 5xx) sessizce EMPTY donulur — dropdown
 * "Sonuc bulunamadi" gosterir, error toast atmaz.
 */
export async function searchAll(
  query: string,
  lang: "tr" | "en",
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const q = query.trim();
  if (!q) return EMPTY_SEARCH;
  try {
    // types: mevcut gruplar + haber (news). Bos birakilsa backend hepsini
    // dondururdu; haberi acikca istemek icin listeye ekliyoruz.
    const qs = new URLSearchParams({
      q,
      lang,
      types: "team,league,player,fixture,country,coach,news",
    });
    const res = await fetch(`/api/search?${qs.toString()}`, {
      cache: "no-store",
      signal,
    });
    if (!res.ok) return EMPTY_SEARCH;
    return (await res.json()) as SearchResponse;
  } catch (err) {
    // AbortError veya network — sessiz fallback
    if ((err as { name?: string })?.name === "AbortError") {
      throw err; // caller cleanup'inda yutar; race'i bilmesi gerekir
    }
    return EMPTY_SEARCH;
  }
}
