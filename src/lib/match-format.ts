/**
 * Maç detay format helper'ları — saat, tarih, dakika.
 */

export function formatKickoffShort(iso: string, lang: "tr" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function formatDate(iso: string, lang: "tr" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function formatMinute(elapsed?: number | null, extra?: number | null): string {
  if (elapsed == null) return "";
  return extra ? `${elapsed}+${extra}'` : `${elapsed}'`;
}
