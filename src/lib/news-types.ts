// Backend haber (news) DTO'larinin TS karsiligi.
// Kaynak: com.scorestv.news.dto.{NewsListItem,NewsPageResponse,NewsDetail}
//   Public uclar:
//     GET /api/v1/news?lang=&page=&size=&category=&sport=&teamId=&leagueId=&featured=
//     GET /api/v1/news/{slug}

// Backend NewsCategory enum ile birebir.
export type NewsCategory =
  | "TRANSFER"
  | "MATCH"
  | "INJURY"
  | "INTERVIEW"
  | "PREVIEW"
  | "RESULT"
  | "GENERAL";

// NewsListItem — hafif liste ogesi (body icermez).
export interface NewsListItem {
  id: number;
  slug: string;
  lang: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  category: NewsCategory | null;
  sport: string | null;
  isBreaking: boolean;
  isFeatured: boolean;
  publishedAt: string | null; // ISO-8601 (Instant)
  readingMinutes: number | null;
}

// NewsPageResponse — sayfali liste yaniti.
export interface NewsPageResponse {
  items: NewsListItem[];
  totalCount: number;
  hasNext: boolean;
}

// NewsDetail.EntityRef — bagli varlik hafif referansi.
export interface NewsEntityRef {
  id: number;
  name: string;
  logo: string | null;
}

// NewsDetail — detay yaniti (sanitize edilmis body + bagli varliklar).
export interface NewsDetail {
  id: number;
  slug: string;
  lang: string;
  title: string;
  summary: string | null;
  body: string | null; // SUNUCUDA SANITIZE EDILMIS HTML — oldugu gibi render edilir
  coverImageUrl: string | null;
  status: string;
  category: NewsCategory | null;
  sport: string | null;
  isBreaking: boolean;
  isFeatured: boolean;
  authorName: string | null;
  viewCount: number;
  readingMinutes: number | null;
  source: string | null;
  sourceUrl: string | null;
  publishedAt: string | null; // ISO-8601 (Instant)
  translationGroupId: number | null;
  availableLangs: string[] | null;
  teams: NewsEntityRef[] | null;
  leagues: NewsEntityRef[] | null;
  countries: NewsEntityRef[] | null;
  players: NewsEntityRef[] | null;
}
