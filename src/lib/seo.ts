import type { Lang } from "@/i18n/auth-strings";

/** Ana sayfa SEO başlık/açıklamaları — hem sunucu (layout generateMetadata) hem
 *  client (DynamicSeo, dil değişince anında günceller) tarafından kullanılır. */
export const HOME_META: Record<
  Lang,
  { title: string; description: string; locale: string }
> = {
  en: {
    title: "Scores TV | Live Scores, Results, Sports News & Video Highlights",
    description:
      "Follow live scores, match results, fixtures, standings, transfer news and video highlights from football, basketball, tennis and more. Scores TV delivers real-time sports coverage, breaking news and live updates from around the world.",
    locale: "en_US",
  },
  tr: {
    title:
      "Scores TV | Canlı Skor, Spor Haberleri, Maç Sonuçları ve Video Özetler",
    description:
      "Futbol, basketbol, tenis ve tüm spor dallarında canlı skorlar, maç sonuçları, puan durumları, transfer haberleri ve video özetleri. Sporun yeni adresi Scores TV.",
    locale: "tr_TR",
  },
};
