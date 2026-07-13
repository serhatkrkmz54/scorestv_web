// ---------------------------------------------------------------------------
// Uygulama mağaza linkleri — tek kaynak. ENV ile ezilebilir (link değişirse
// yeniden derleme gerekmesin), yoksa gerçek değerlere düşer.
//   App Store  : "Scores TV: Live Scores"  (id 6782667299)
//   Google Play: com.scorestv.mobile
// ---------------------------------------------------------------------------

export const APP_STORE_ID = "6782667299";
export const PLAY_PACKAGE = "com.scorestv.mobile";

export const APPSTORE_URL =
  process.env.NEXT_PUBLIC_APPSTORE_URL ??
  `https://apps.apple.com/app/id${APP_STORE_ID}`;

export const PLAYSTORE_URL =
  process.env.NEXT_PUBLIC_PLAYSTORE_URL ??
  `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`;

/** Cihaza göre yönlendiren akıllı indirme sayfası (scorestv.app buraya düşer). */
export const DOWNLOAD_PATH = "/indir";

/** Uygulama tanitim (landing) domaini — scorestv.com indirme CTA'lari buraya
 *  yonlendirir; scorestv.app cihaza gore dogru magazaya atar. ENV ile ezilebilir. */
export const APP_LANDING_URL =
  process.env.NEXT_PUBLIC_APP_LANDING_URL ?? "https://scorestv.app";
