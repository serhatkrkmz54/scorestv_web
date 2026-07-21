import Link from "next/link";

export interface Crumb {
  position: number;
  name: string;
  url: string;
}

/**
 * Hazır BreadcrumbList JSON-LD string'inden görünür breadcrumb için `Crumb[]`
 * çıkarır. Basketbol/voleybol SEO'su breadcrumb'ı dizi yerine önceden üretilmiş
 * JSON-LD string (`breadcrumbsJsonLd`) olarak veriyor; futbolla aynı görünür
 * bileşeni kullanabilmek için bu string parse edilir. Aynı veri olduğundan
 * görünür breadcrumb ile JSON-LD tutarlı kalır. Parse edilemezse null döner.
 */
export function crumbsFromJsonLd(jsonLd: string | null | undefined): Crumb[] | null {
  if (!jsonLd) return null;
  try {
    const parsed = JSON.parse(jsonLd) as unknown;
    const list = Array.isArray(parsed)
      ? (parsed.find(
          (x) => (x as Record<string, unknown>)?.["@type"] === "BreadcrumbList",
        ) as Record<string, unknown> | undefined)
      : (parsed as Record<string, unknown>)?.["@type"] === "BreadcrumbList"
        ? (parsed as Record<string, unknown>)
        : undefined;
    const items = list?.["itemListElement"];
    if (!Array.isArray(items)) return null;
    const crumbs: Crumb[] = items
      .map((it, idx) => {
        const o = (it ?? {}) as Record<string, unknown>;
        const rawItem = o["item"];
        const url =
          typeof rawItem === "string"
            ? rawItem
            : String((rawItem as Record<string, unknown>)?.["@id"] ?? "");
        return {
          position: typeof o["position"] === "number" ? (o["position"] as number) : idx + 1,
          name: String(o["name"] ?? ""),
          url,
        };
      })
      .filter((c) => c.name && c.url);
    return crumbs.length >= 2 ? crumbs : null;
  } catch {
    return null;
  }
}

/**
 * Görünür breadcrumb (SSR) — backend `seo.breadcrumbs` listesinden üretilir ve
 * sayfadaki JSON-LD BreadcrumbList ile BİREBİR eşleşir (Google, görünür
 * breadcrumb ile yapısal veriyi tutarlı ister). Örn: "Ana Sayfa › Al-Nassr ›
 * Ronaldo".
 *
 * - Son öğe = geçerli sayfa → link DEĞİL (`aria-current="page"`).
 * - Diğerleri Next `<Link>` (hem crawlable hem client-side gezinme).
 * - Backend mutlak URL veriyor (https://site/...) — iç linkler için origin
 *   soyulup relatif path'e çevrilir; parse edilemezse olduğu gibi bırakılır.
 * - 2'den az öğe varsa hiç render edilmez (anlamsız breadcrumb gösterme).
 */
export function Breadcrumb({ items }: { items?: Crumb[] | null }) {
  if (!items || items.length < 2) return null;
  const sorted = [...items].sort((a, b) => a.position - b.position);

  const toHref = (url: string): string => {
    try {
      const u = new URL(url);
      return u.pathname + u.search;
    } catch {
      return url;
    }
  };

  return (
    <nav className="detail-breadcrumb" aria-label="breadcrumb">
      <ol>
        {sorted.map((c, i) => {
          const last = i === sorted.length - 1;
          return (
            <li key={`${c.position}-${c.name}`}>
              {last ? (
                <span className="cur" aria-current="page">
                  {c.name}
                </span>
              ) : (
                <Link href={toHref(c.url)}>{c.name}</Link>
              )}
              {!last && (
                <span className="sep" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
