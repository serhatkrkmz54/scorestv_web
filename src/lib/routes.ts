// Dile göre URL üretimi. TR ve EN farklı prefix kullanır:
//   maç:  TR /mac/<slug>      EN /match/<slug>
//   lig:  TR /lig/<id>        EN /league/<id>
//   takım: TR /takim/<id>     EN /team/<id>
//   oyuncu: TR /oyuncu/<id>   EN /player/<id>
import type { Lang } from "@/i18n/auth-strings";

export function matchPath(lang: Lang, slug: string): string {
  return `/${lang === "tr" ? "mac" : "match"}/${slug}`;
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
