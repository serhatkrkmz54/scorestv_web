import { APP_LANDING_URL } from "@/lib/store-links";

/**
 * Anasayfa üst şeridi: mobil oyunu (maç tahmin düelloları / Scores Puanı)
 * tanıtır ve uygulama tanıtım sayfasına (scorestv.app → cihaza göre mağaza)
 * yönlendirir. Oyun WEB'de yok; bu şerit yalnızca app'e kanal.
 *
 * SSR-güvenli: statik metin + tek <a> (hook/fetch yok) → ilk HTML'de gelir,
 * LCP'yi geciktirmez. `flexWrap` ile mobilde alt satıra sarar.
 */
export function GamePromoStrip({ lang }: { lang: "tr" | "en" }) {
  const text =
    lang === "tr"
      ? "Maç tahmin düellolarına katıl, Scores Puanı kazan!"
      : "Join match prediction duels, earn Scores Points!";
  const cta = lang === "tr" ? "Uygulamada oyna" : "Play in the app";
  const badge = lang === "tr" ? "OYUN" : "GAME";

  return (
    <a
      href={APP_LANDING_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} — ${cta}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 10,
        margin: "10px 0",
        padding: "10px 16px",
        borderRadius: 14,
        background: "linear-gradient(135deg, #6d28d9, #db2777)",
        color: "#fff",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1,
          background: "rgba(255,255,255,0.22)",
          color: "#fff",
          padding: "2px 8px",
          borderRadius: 999,
        }}
      >
        {badge}
      </span>
      <span>{text}</span>
      <span style={{ color: "#fde68a", fontWeight: 800 }}>{cta} →</span>
    </a>
  );
}
