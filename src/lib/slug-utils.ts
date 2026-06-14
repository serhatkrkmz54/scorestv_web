// Slug helper'lari — backend SlugUtil ile birebir.
// Backend slug formati: "{entity-adi}-{id}" veya "{home}-{away}-{id}" (mac).

// Slug sonundan fixture id'yi cek. "galatasaray-fenerbahce-1234567" -> 1234567
export function extractFixtureId(slug: string): number | null {
  const m = /-(\d+)$/.exec(slug);
  return m ? Number(m[1]) : null;
}

// Slug sonundan generic id'yi cek (lig, takim, oyuncu icin ortak).
export function extractIdFromSlug(slug: string): number | null {
  const m = /-(\d+)$/.exec(slug);
  return m ? Number(m[1]) : null;
}

function slugifyName(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Mac slug uret — backend slug yoksa fallback.
// Format: "{home-slug}-{away-slug}-{fixtureId}".
export function buildMatchSlug(
  homeName: string,
  awayName: string,
  fixtureId: number,
): string {
  return slugifyName(homeName) + "-" + slugifyName(awayName) + "-" + fixtureId;
}

// Backend slug formati: "{name-slug}-{id}". Backend slug gondermediginde
// frontend ayni mantikla uretir (lig, takim, oyuncu icin generic).
export function buildEntitySlug(name: string, id: number): string {
  return slugifyName(name) + "-" + id;
}
