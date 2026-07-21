import type { Lang } from "@/i18n/auth-strings";
import { Logo } from "@/components/shell/Logo";
import { StoreBadges } from "./StoreBadges";

// Cihaza göre yönlendirme yapılmayan durumlarda (masaüstü / bot) gösterilen
// indirme sayfası içeriği. Saf sunucu bileşeni (hook yok), TR/EN.
export function DownloadLanding({ lang }: { lang: Lang }) {
  const tr = lang === "tr";

  const features = tr
    ? [
        "Canlı skorlar ve anlık gol / kart bildirimleri",
        "Kadro, diziliş ve maç istatistikleri",
        "AI Analiz — maç asistanı",
        "Favori takımlarını takip et",
      ]
    : [
        "Live scores and instant goal / card notifications",
        "Squads, lineups and match statistics",
        "AI Analysis — your match assistant",
        "Follow your favourite teams",
      ];

  return (
    <div className="dl-page">
      <section className="dl-hero">
        <div className="dl-logo">
          <Logo h={44} />
        </div>
        <h1 className="dl-title">
          {tr ? "Uygulamayı indir" : "Get the Scores TV app"}
        </h1>
        <p className="dl-subtitle">
          {tr
            ? "Canlı skorlar, bildirimler, diziliş ve AI Analiz — hepsi cebinde."
            : "Live scores, notifications, lineups and AI Analysis — all in your pocket."}
        </p>

        <StoreBadges className="dl-badges" />

        <ul className="dl-features">
          {features.map((f) => (
            <li key={f}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="dl-check">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 6 9 17l-5-5"
                />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <p className="dl-hint">
          {tr
            ? "Cihazına göre doğru mağazaya otomatik yönlendirilirsin."
            : "You'll be sent to the right store automatically for your device."}
        </p>
      </section>
    </div>
  );
}
