import type { Lang } from "@/i18n/auth-strings";
import type { NewsCategory } from "./news-types";

// Haber (news) format + i18n yardimcilari — kategori etiketleri, tarih, yol.

// Haber detay yolu — dile gore TR /haber/<slug>, EN /news/<slug>.
export function newsPath(lang: Lang, slug: string): string {
  return `/${lang === "tr" ? "haber" : "news"}/${slug}`;
}

// Haber liste yolu — TR/EN tek adres /haberler (cookie/geo diliyle calisir,
// tıpkı /siralama sitemap'te tek URL oldugu gibi). Dil cookie ile belirlenir.
export function newsListPath(_lang: Lang): string {
  return "/haberler";
}

// Kategori etiketleri (TR/EN). Backend enum → gorunur ad.
const CATEGORY_LABELS: Record<NewsCategory, { tr: string; en: string }> = {
  TRANSFER: { tr: "Transfer", en: "Transfer" },
  MATCH: { tr: "Maç", en: "Match" },
  INJURY: { tr: "Sakatlık", en: "Injury" },
  INTERVIEW: { tr: "Röportaj", en: "Interview" },
  PREVIEW: { tr: "Ön İzleme", en: "Preview" },
  RESULT: { tr: "Sonuç", en: "Result" },
  GENERAL: { tr: "Genel", en: "General" },
};

export function categoryLabel(
  category: NewsCategory | null | undefined,
  lang: Lang,
): string {
  if (!category) return lang === "tr" ? "Genel" : "General";
  const l = CATEGORY_LABELS[category];
  return l ? l[lang] : category;
}

// Liste/filtre sirasindaki kategoriler (GENERAL dahil, TRANSFER once).
export const NEWS_CATEGORIES: NewsCategory[] = [
  "TRANSFER",
  "MATCH",
  "RESULT",
  "PREVIEW",
  "INJURY",
  "INTERVIEW",
  "GENERAL",
];

// Yayin tarihi — kisa gorunur bicim (gun ay yil).
export function formatNewsDate(iso: string | null, lang: Lang): string {
  if (!iso) return "";
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

// Goreli zaman ("5 dk once" / "2 saat once") — anasayfa rail'i icin kompakt.
export function formatRelativeTime(iso: string | null, lang: Lang): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diffMin = Math.round((Date.now() - t) / 60000);
  const isTr = lang === "tr";
  if (diffMin < 1) return isTr ? "az önce" : "just now";
  if (diffMin < 60) return isTr ? `${diffMin} dk önce` : `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return isTr ? `${diffHr} saat önce` : `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return isTr ? `${diffDay} gün önce` : `${diffDay}d ago`;
  return formatNewsDate(iso, lang);
}

// Okuma suresi etiketi ("5 dk okuma" / "5 min read").
export function readingLabel(
  minutes: number | null | undefined,
  lang: Lang,
): string {
  if (!minutes || minutes <= 0) return "";
  return lang === "tr" ? `${minutes} dk okuma` : `${minutes} min read`;
}
