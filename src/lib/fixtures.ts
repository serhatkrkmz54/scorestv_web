// Maç durumu / skor için saf yardımcılar (client + server güvenli).
import type { FixtureScore, FixtureStatus, ScorePeriod, StatusCategory } from "./fixtures-types";
import type { Lang } from "@/i18n/auth-strings";

const LIVE_CODES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
const FINISHED_CODES = new Set(["FT", "AET", "PEN", "WO", "AWD"]);

export function categorize(status: FixtureStatus): StatusCategory {
  const code = status.shortCode ?? "";
  if (status.elapsed != null || LIVE_CODES.has(code)) return "live";
  if (FINISHED_CODES.has(code)) return "finished";
  return "upcoming";
}

/**
 * Kısa status etiketleri — dar maç satırına sığması için (tam metin değil).
 * Tam (longText) metin maç detay sayfasında kullanılır.
 */
const STATUS_SHORT: Record<string, { tr: string; en: string }> = {
  FT: { tr: "Bitti", en: "FT" },
  AET: { tr: "Uzatma", en: "AET" },
  PEN: { tr: "Penaltı", en: "Pen" },
  HT: { tr: "İY", en: "HT" },
  BT: { tr: "Ara", en: "BT" },
  P: { tr: "Pen.", en: "Pen" },
  SUSP: { tr: "Durdu", en: "Susp" },
  INT: { tr: "Kesildi", en: "Int" },
  PST: { tr: "Ertelendi", en: "Postp" },
  CANC: { tr: "İptal", en: "Canc" },
  ABD: { tr: "Tatil", en: "Aband" },
  WO: { tr: "Hükmen", en: "WO" },
  AWD: { tr: "Hükmen", en: "Awd" },
  LIVE: { tr: "Canlı", en: "Live" },
  TBD: { tr: "—", en: "—" },
};

/** Oynanan dakika: "90+1'" / "45'"; dakikalı bir durum değilse "" döner. */
export function liveClock(status: FixtureStatus): string {
  const code = status.shortCode ?? "";
  if (status.elapsed != null && code !== "HT" && code !== "BT" && code !== "P") {
    return status.extra ? `${status.elapsed}+${status.extra}'` : `${status.elapsed}'`;
  }
  return "";
}

/** Yaklaşan maçın başlama saati (yerel saat, HH:mm). */
export function kickoffTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** Maç satırı için kısa status etiketi (Bitti / FT / İY / Pen…). */
export function statusLabelShort(status: FixtureStatus, lang: Lang): string {
  const code = status.shortCode ?? "";
  const m = STATUS_SHORT[code];
  return m ? m[lang] : code || (lang === "tr" ? "Bitti" : "FT");
}

/** Bir periyot skorunu "öntakı H-A" biçiminde döndürür; veri yoksa null. */
export function periodScore(
  period: ScorePeriod | null | undefined,
  prefix: string,
): string | null {
  if (!period || period.home == null || period.away == null) return null;
  return `${prefix} ${period.home}-${period.away}`;
}

export function winnerSide(score: FixtureScore): "home" | "away" | null {
  if (score.home == null || score.away == null) return null;
  if (score.home > score.away) return "home";
  if (score.away > score.home) return "away";
  return null;
}

/** Takım monogramı için kısa kod (logo yoksa). */
export function teamMonogram(name: string): string {
  const cleaned = name.replace(/[^A-Za-zÀ-ÿĞğİıŞşÇçÖöÜü\s]/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase() || "?";
}

/** İsimden deterministik renk (monogram zemini). */
export function colorFromName(name: string): string {
  const palette = [
    "#1D428A", "#3D195B", "#E0123A", "#0B1F4E", "#F5630B",
    "#1FA95B", "#0A6CB0", "#6E1423", "#0E7C66", "#7A3E9D",
  ];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return palette[h % palette.length];
}
