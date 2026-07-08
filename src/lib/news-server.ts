import "server-only";
import { backendJson } from "./backend";
import type { Lang } from "@/i18n/auth-strings";
import type {
  NewsCategory,
  NewsDetail,
  NewsListItem,
  NewsPageResponse,
} from "./news-types";

// Haber (news) SSR fetch yardimcilari — public uclara backend uzerinden erisir.
// Tum hatalar nazikce yutulur (bos liste / null doner, sayfayi ASLA yikmaz).
// Dil her zaman gecerli site dilidir: TR sayfa TR haber, EN sayfa EN haber.

const EMPTY_PAGE: NewsPageResponse = {
  items: [],
  totalCount: 0,
  hasNext: false,
};

export interface NewsListParams {
  lang: Lang;
  page?: number;
  size?: number;
  category?: NewsCategory | null;
  sport?: string | null;
  featured?: boolean | null;
}

/** Yayinda haber listesi (sayfali + filtreli). Hata → bos sayfa. */
export async function getNewsList(
  params: NewsListParams,
): Promise<NewsPageResponse> {
  const qs = new URLSearchParams({ lang: params.lang });
  if (params.page != null) qs.set("page", String(params.page));
  if (params.size != null) qs.set("size", String(params.size));
  if (params.category) qs.set("category", params.category);
  if (params.sport) qs.set("sport", params.sport);
  if (params.featured != null) qs.set("featured", String(params.featured));
  const r = await backendJson<NewsPageResponse>(`/api/v1/news?${qs.toString()}`);
  return r.ok && r.body ? r.body : EMPTY_PAGE;
}

/**
 * Haber slider'i (web /haberler ust bandi) — inSlider isaretli yayinda haberler,
 * slider sirasina gore. Hata → bos dizi (sayfayi yikmaz).
 */
export async function getSliderNews(
  lang: Lang,
  limit = 8,
): Promise<NewsListItem[]> {
  const qs = new URLSearchParams({ lang, limit: String(limit) });
  const r = await backendJson<NewsListItem[]>(
    `/api/v1/news/slider?${qs.toString()}`,
  );
  return r.ok && Array.isArray(r.body) ? r.body : [];
}

/**
 * Haber detayi (slug ile). Bulunamazsa {data:null, status}. Sayfa 404'u
 * status uzerinden ayirt eder (mac/takim detay deseniyle ayni).
 */
export async function getNewsBySlug(
  slug: string,
): Promise<{ data: NewsDetail | null; status: number }> {
  const r = await backendJson<NewsDetail>(
    `/api/v1/news/${encodeURIComponent(slug)}`,
  );
  return { data: r.ok && r.body ? r.body : null, status: r.status };
}

/** Anasayfa sag ray + son haberler. Hata → bos dizi. */
export async function getLatestNews(
  lang: Lang,
  limit = 5,
): Promise<NewsListItem[]> {
  const page = await getNewsList({ lang, page: 0, size: limit });
  return page.items;
}

/** Takima bagli ilgili haberler (takim detay sayfasi). Hata → bos dizi. */
export async function getRelatedByTeam(
  teamId: number,
  lang: Lang,
  limit = 5,
): Promise<NewsListItem[]> {
  const qs = new URLSearchParams({
    lang,
    teamId: String(teamId),
    page: "0",
    size: String(limit),
  });
  const r = await backendJson<NewsPageResponse>(`/api/v1/news?${qs.toString()}`);
  return r.ok && r.body ? r.body.items : [];
}

/** Lige bagli ilgili haberler (lig detay sayfasi). Hata → bos dizi. */
export async function getRelatedByLeague(
  leagueId: number,
  lang: Lang,
  limit = 5,
): Promise<NewsListItem[]> {
  const qs = new URLSearchParams({
    lang,
    leagueId: String(leagueId),
    page: "0",
    size: String(limit),
  });
  const r = await backendJson<NewsPageResponse>(`/api/v1/news?${qs.toString()}`);
  return r.ok && r.body ? r.body.items : [];
}

/**
 * Slug ile ilgili haberler — GET /api/v1/news/{slug}/related. ES ranked;
 * backend DB fallback saglar. Ayni dil + yayinda + kendisi haric. Bu uc
 * dogrudan NewsListItem[] doner (sayfali degil). Hata → bos dizi.
 */
export async function getRelatedBySlug(
  slug: string,
  limit = 6,
): Promise<NewsListItem[]> {
  const qs = new URLSearchParams({ limit: String(limit) });
  const r = await backendJson<NewsListItem[]>(
    `/api/v1/news/${encodeURIComponent(slug)}/related?${qs.toString()}`,
  );
  return r.ok && Array.isArray(r.body) ? r.body : [];
}

/** Maca (fixture) bagli haberler (mac detay sayfasi). Hata → bos dizi. */
export async function getNewsByFixture(
  fixtureId: number,
  lang: Lang,
  limit = 5,
): Promise<NewsListItem[]> {
  const qs = new URLSearchParams({
    lang,
    fixtureId: String(fixtureId),
    page: "0",
    size: String(limit),
  });
  const r = await backendJson<NewsPageResponse>(`/api/v1/news?${qs.toString()}`);
  return r.ok && r.body ? r.body.items : [];
}
