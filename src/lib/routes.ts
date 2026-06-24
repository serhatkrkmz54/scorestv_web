// Dile göre URL üretimi. TR ve EN farklı prefix kullanır:
//   maç:  TR /mac/<slug>      EN /match/<slug>
//   lig:  TR /lig/<id>        EN /league/<id>
//   takım: TR /takim/<id>     EN /team/<id>
//   oyuncu: TR /oyuncu/<id>   EN /player/<id>
//   sıralama: TR /siralama    EN /rankings
// Cok-spor mac detay rotalari (futbol DEGISMEZ):
//   basketbol: TR /basketbol/mac/<slug>  EN /basketball/match/<slug>
//   voleybol:  TR /voleybol/mac/<slug>   EN /volleyball/match/<slug>
import type { Lang } from "@/i18n/auth-strings";

export function matchPath(lang: Lang, slug: string): string {
  return `/${lang === "tr" ? "mac" : "match"}/${slug}`;
}
export function basketballMatchPath(lang: Lang, slug: string): string {
  return `/${lang === "tr" ? "basketbol/mac" : "basketball/match"}/${slug}`;
}
export function volleyballMatchPath(lang: Lang, slug: string): string {
  return `/${lang === "tr" ? "voleybol/mac" : "volleyball/match"}/${slug}`;
}
export function leaguePath(lang: Lang, idOrSlug: string | number): string {
  return `/${lang === "tr" ? "lig" : "league"}/${idOrSlug}`;
}
export function teamPath(lang: Lang, idOrSlug: string | number): string {
  return `/${lang === "tr" ? "takim" : "team"}/${idOrSlug}`;
}
export function playerPath(lang: Lang, idOrSlug: string | number): string {
  return `/${lang === "tr" ? "oyuncu" : "player"}/${idOrSlug}`;
}
export function countryPath(lang: Lang, idOrSlug: string | number): string {
  return `/${lang === "tr" ? "ulke" : "country"}/${idOrSlug}`;
}
export function rankingsPath(lang: Lang): string {
  return lang === "tr" ? "/siralama" : "/rankings";
}

// Mevcut path'i hedef dile cevir. Lang switcher kullaniyor.
//   /mac/X (TR) <-> /match/X (EN), vs.
// Bilinmeyen rotalar oldugu gibi donulur (anasayfa, profil, vb.).
const SEG_MAP: Record<string, { tr: string; en: string }> = {
  mac: { tr: "mac", en: "match" },
  match: { tr: "mac", en: "match" },
  lig: { tr: "lig", en: "league" },
  league: { tr: "lig", en: "league" },
  takim: { tr: "takim", en: "team" },
  team: { tr: "takim", en: "team" },
  oyuncu: { tr: "oyuncu", en: "player" },
  player: { tr: "oyuncu", en: "player" },
  ulke: { tr: "ulke", en: "country" },
  country: { tr: "ulke", en: "country" },
  siralama: { tr: "siralama", en: "rankings" },
  rankings: { tr: "siralama", en: "rankings" },
  basketbol: { tr: "basketbol", en: "basketball" },
  basketball: { tr: "basketbol", en: "basketball" },
  voleybol: { tr: "voleybol", en: "volleyball" },
  volleyball: { tr: "voleybol", en: "volleyball" },
};

// Ikinci segment cevirisi (spor mac detayinda /basketbol/mac <-> /basketball/match).
const SEG2_MAP: Record<string, { tr: string; en: string }> = {
  mac: { tr: "mac", en: "match" },
  match: { tr: "mac", en: "match" },
};

export function translatePath(currentPath: string, targetLang: Lang): string {
  const parts = currentPath.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const first = parts[0].toLowerCase();
  const mapping = SEG_MAP[first];
  if (!mapping) return currentPath;
  parts[0] = mapping[targetLang];
  // Spor mac detayi: /basketbol/mac/<slug> -> ikinci segmenti de cevir.
  if ((first === "basketbol" || first === "basketball" || first === "voleybol" || first === "volleyball") && parts.length >= 2) {
    const second = parts[1].toLowerCase();
    const m2 = SEG2_MAP[second];
    if (m2) parts[1] = m2[targetLang];
  }
  return "/" + parts.join("/");
}
