import type { Highlight } from "./highlights-types";
import type { MatchDetailResponse } from "./match-detail-types";

const FINISHED = new Set(["FT", "AET", "PEN"]);

// YouTube 11-karakter video ID'sini embed/watch URL'inden çıkarır.
function ytId(url?: string | null): string | null {
  if (!url) return null;
  const m = /(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/)([A-Za-z0-9_-]{11})/.exec(
    url,
  );
  return m ? m[1] : null;
}

/**
 * Biten maç + highlight listesinden Schema.org VideoObject JSON-LD üretir
 * (maç özeti videosunu Google Video zengin sonucuna aday yapar). Uygun video
 * yoksa {@code null} döner.
 *
 * Seçim: önce YouTube kaynaklı (kararlı thumbnail + embed), yoksa embedUrl'li,
 * yoksa ilk highlight. thumbnailUrl zorunlu — imgUrl yoksa YouTube küçük
 * resmine düşülür; o da yoksa null. uploadDate maç tarihiyle yaklaşıklanır
 * (özet genelde maçtan birkaç saat sonra yayınlanır).
 */
export function videoObjectJsonLd(
  detail: MatchDetailResponse,
  highlights: Highlight[],
  lang: "tr" | "en",
): string | null {
  if (!FINISHED.has(detail.status.shortCode)) return null;
  if (!highlights || highlights.length === 0) return null;

  const pick =
    highlights.find((h) => ytId(h.embedUrl) || ytId(h.url)) ??
    highlights.find((h) => h.embedUrl) ??
    highlights[0];
  if (!pick) return null;

  const id = ytId(pick.embedUrl) ?? ytId(pick.url);
  const thumb =
    pick.imgUrl ?? (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);
  if (!thumb) return null; // thumbnailUrl VideoObject için zorunlu

  const home = detail.homeTeam.name;
  const away = detail.awayTeam.name;
  const name =
    pick.title ||
    (lang === "tr"
      ? `${home} - ${away} Maç Özeti`
      : `${home} vs ${away} Highlights`);
  const description =
    lang === "tr"
      ? `${home} - ${away} maçının özeti, golleri ve önemli anları.`
      : `Highlights, goals and key moments of ${home} vs ${away}.`;

  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl: thumb,
    uploadDate: detail.kickoff,
  };
  // embedUrl (oynatıcı) tercih edilir — YouTube'un izleme sayfasını contentUrl
  // yapmak Google uyarısı üretir. Yalnız embed yoksa contentUrl'e (ham/kaynak
  // url) düşülür.
  const embedUrl = id ? `https://www.youtube.com/embed/${id}` : pick.embedUrl;
  if (embedUrl) {
    obj.embedUrl = embedUrl;
  } else if (pick.url) {
    obj.contentUrl = pick.url;
  }

  return JSON.stringify(obj);
}
