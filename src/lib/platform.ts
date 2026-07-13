// ---------------------------------------------------------------------------
// Basit User-Agent tabanlı platform tespiti. Hem sunucuda (headers) hem
// istemcide (navigator.userAgent) kullanılabilir.
// ---------------------------------------------------------------------------

export type Platform = "ios" | "android" | "other";

/** UA'dan platform çıkar. iPadOS 13+ Safari masaüstü UA'sı bildirir → "other"
 *  (landing gösterilir; kullanıcı rozetten seçer). */
export function detectPlatform(ua: string | null | undefined): Platform {
  const s = (ua ?? "").toLowerCase();
  if (/iphone|ipad|ipod/.test(s)) return "ios";
  if (/android/.test(s)) return "android";
  return "other";
}

/** Arama motoru / sosyal önizleme botu mu? Botları mağazaya YÖNLENDİRME
 *  (sayfa indekslenebilir kalsın, Googlebot-Mobile Android UA taşır). */
export function isBot(ua: string | null | undefined): boolean {
  return /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|whatsapp|telegrambot|embedly|quora link preview|pinterest|redditbot|applebot|discordbot|googlebot|bingbot|yandex|duckduckbot/i.test(
    ua ?? "",
  );
}
