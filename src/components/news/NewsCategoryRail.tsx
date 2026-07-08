import Link from "next/link";
import {
  NEWS_CATEGORIES,
  categoryLabel,
  newsListPath,
} from "@/lib/news-format";
import type { NewsCategory } from "@/lib/news-types";
import type { Lang } from "@/i18n/auth-strings";
import { IconNews } from "@/components/icons";

/**
 * Haber kategorileri sol rail'i — anasayfadaki ligler/ülkeler rail'i (rl-*)
 * ile aynı görünüm. Liste ve detay sayfalarında sol kolonda görünür.
 * `active` verilirse o kategori vurgulanır (liste sayfası).
 */
export function NewsCategoryRail({
  lang,
  active = null,
}: {
  lang: Lang;
  active?: NewsCategory | null;
}) {
  const base = newsListPath(lang);
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return (
    <div className="rl-section news-cat-rail">
      <div className="rl-head">
        <span className="flame">
          <IconNews s={14} />
        </span>
        {t("Kategoriler", "Categories")}
      </div>
      <Link
        href={base}
        className={`rl-item news-cat-item${active === null ? " on" : ""}`}
      >
        <span className="nm">{t("Tümü", "All")}</span>
      </Link>
      {NEWS_CATEGORIES.map((c) => (
        <Link
          key={c}
          href={`${base}?category=${c}`}
          className={`rl-item news-cat-item${active === c ? " on" : ""}`}
        >
          <span className="nm">{categoryLabel(c, lang)}</span>
        </Link>
      ))}
    </div>
  );
}
