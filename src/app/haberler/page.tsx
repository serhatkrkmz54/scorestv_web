import type { Metadata } from "next";
import Link from "next/link";
import { resolveLang } from "@/lib/lang-server";
import { getNewsList } from "@/lib/news-server";
import { NewsCard } from "@/components/news/NewsCard";
import {
  NEWS_CATEGORIES,
  categoryLabel,
  newsPath,
} from "@/lib/news-format";
import type { NewsCategory } from "@/lib/news-types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";
const PAGE_SIZE = 18;

// Liste sayfasi cookie/geo diliyle calisir (TR/EN ayni /haberler adresi) —
// tıpkı /siralama, /canli-mac-programi gibi.
export async function generateMetadata(): Promise<Metadata> {
  const lang = await resolveLang();
  const isTr = lang === "tr";
  const title = isTr
    ? "Spor Haberleri — Son Dakika, Transfer ve Maç Haberleri | Scores TV"
    : "Sports News — Breaking, Transfer & Match News | Scores TV";
  const description = isTr
    ? "Futbol, basketbol ve tüm spor dallarında son dakika, transfer, maç ve sakatlık haberleri. Güncel spor gündemi Scores TV'de."
    : "Breaking, transfer, match and injury news from football, basketball and all sports. Stay up to date with the latest sports agenda on Scores TV.";
  const url = `${SITE}/haberler`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: `${SITE}/og-image.png` }],
      locale: isTr ? "tr_TR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE}/og-image.png`],
    },
  };
}

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

function isCategory(v: string | undefined): v is NewsCategory {
  return !!v && (NEWS_CATEGORIES as string[]).includes(v);
}

export default async function NewsListPage({ searchParams }: PageProps) {
  const lang = await resolveLang();
  const isTr = lang === "tr";
  const sp = await searchParams;
  const category = isCategory(sp.category) ? sp.category : null;
  const page = Math.max(0, Number(sp.page ?? 0) || 0);

  const data = await getNewsList({
    lang,
    page,
    size: PAGE_SIZE,
    category,
  });

  // Öne çıkan / son dakika vurgusu — yalnız ilk sayfada ve filtre yokken.
  const featured =
    page === 0 && !category
      ? data.items.find((n) => n.isFeatured || n.isBreaking) ?? null
      : null;
  const rest = featured
    ? data.items.filter((n) => n.id !== featured.id)
    : data.items;

  const t = (tr: string, en: string) => (isTr ? tr : en);

  // Filtre linkleri category query param'i degistirir, page'i sifirlar.
  const catHref = (c: NewsCategory | null) =>
    c ? `/haberler?category=${c}` : "/haberler";
  const pageHref = (p: number) => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (p > 0) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/haberler?${qs}` : "/haberler";
  };

  return (
    <div className="news-page">
      <header className="news-page-head">
        <h1>{t("Haberler", "News")}</h1>
        <p className="news-page-sub">
          {t(
            "Son dakika, transfer ve maç haberleri.",
            "Breaking, transfer and match news.",
          )}
        </p>
      </header>

      <nav className="news-filters" aria-label={t("Kategoriler", "Categories")}>
        <Link
          href={catHref(null)}
          className={`news-filter${category === null ? " on" : ""}`}
        >
          {t("Tümü", "All")}
        </Link>
        {NEWS_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={catHref(c)}
            className={`news-filter${category === c ? " on" : ""}`}
          >
            {categoryLabel(c, lang)}
          </Link>
        ))}
      </nav>

      {data.items.length === 0 ? (
        <div className="news-empty">
          <p>
            {t(
              "Şu an gösterilecek haber yok.",
              "There are no news to show right now.",
            )}
          </p>
        </div>
      ) : (
        <>
          {featured ? (
            <Link
              href={newsPath(lang, featured.slug)}
              className="news-featured"
            >
              <div className="news-featured-cover">
                {featured.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.coverImageUrl} alt="" />
                ) : (
                  <span className="news-featured-cover-fb" />
                )}
                <div className="news-featured-overlay">
                  <div className="news-featured-chips">
                    {featured.isBreaking ? (
                      <span className="news-chip news-chip-breaking">
                        {t("Son Dakika", "Breaking")}
                      </span>
                    ) : (
                      <span className="news-chip news-chip-featured">
                        {t("Öne Çıkan", "Featured")}
                      </span>
                    )}
                    <span className="news-chip news-chip-cat">
                      {categoryLabel(featured.category, lang)}
                    </span>
                  </div>
                  <h2 className="news-featured-title">{featured.title}</h2>
                  {featured.summary ? (
                    <p className="news-featured-summary">{featured.summary}</p>
                  ) : null}
                </div>
              </div>
            </Link>
          ) : null}

          <div className="news-grid">
            {rest.map((n) => (
              <NewsCard key={n.id} item={n} lang={lang} />
            ))}
          </div>

          {(page > 0 || data.hasNext) && (
            <nav className="news-pager" aria-label={t("Sayfalama", "Pagination")}>
              {page > 0 ? (
                <Link href={pageHref(page - 1)} className="news-pager-btn">
                  ‹ {t("Önceki", "Previous")}
                </Link>
              ) : (
                <span className="news-pager-btn disabled">
                  ‹ {t("Önceki", "Previous")}
                </span>
              )}
              <span className="news-pager-info">
                {t("Sayfa", "Page")} {page + 1}
              </span>
              {data.hasNext ? (
                <Link href={pageHref(page + 1)} className="news-pager-btn">
                  {t("Sonraki", "Next")} ›
                </Link>
              ) : (
                <span className="news-pager-btn disabled">
                  {t("Sonraki", "Next")} ›
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
