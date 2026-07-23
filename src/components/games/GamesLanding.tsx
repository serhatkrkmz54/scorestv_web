import Link from "next/link";
import { Barlow_Condensed } from "next/font/google";
import type { Lang } from "@/i18n/auth-strings";
import type { GameLeaderboardEntry } from "@/lib/games-server";
import { StoreBadges } from "@/components/download/StoreBadges";
import { Logo } from "@/components/shell/Logo";
import { DOWNLOAD_PATH } from "@/lib/store-links";
import {
  IconBall,
  IconBars,
  IconDownload,
  IconFlame,
  IconPoint,
  IconQuestion,
  IconTarget,
  IconTrophy,
} from "@/components/icons";

// Oyunlar sayfasına özel display fontu — tasarımdaki (Claude Design handoff)
// Barlow Condensed başlıklar. Sadece bu sayfada yüklenir.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-barlowc",
  display: "swap",
});

// Oyun kartları — tasarımdan birebir (gradient + foto). `live: false` olan
// oyunlar "Yakında" rozetiyle gösterilir; oyun web/app'te açılınca bayrağı
// çevirmek yeterli.
type GameCard = {
  key: string;
  icon: React.ReactNode;
  bg: string;
  photo: string;
  live: boolean;
  title: { tr: string; en: string };
  desc: { tr: string; en: string };
  statLine1: { tr: string; en: string };
  statLine2: { tr: string; en: string };
};

const CARDS: GameCard[] = [
  {
    key: "kadronu-kur",
    icon: <IconBall s={64} />,
    bg: "linear-gradient(150deg,#2f6fed,#153a8f)",
    photo: "/games/game-lineup.jpg",
    live: false,
    title: { tr: "Kadronu Kur", en: "Build Your XI" },
    desc: {
      tr: "Takımının sahaya çıkacağı 11'i sen kur, doğru tahminle ödülleri kazan!",
      en: "Pick your team's starting eleven and win rewards for correct predictions!",
    },
    statLine1: { tr: "İlk 11'i tahmin et,", en: "Predict the starting XI," },
    statLine2: { tr: "Scores Puanı kazan.", en: "earn Scores Points." },
  },
  {
    key: "haftanin-oyuncusu",
    icon: <IconFlame s={64} />,
    bg: "linear-gradient(150deg,#e6a117,#9a5c07)",
    photo: "/games/game-potw.jpg",
    live: false,
    title: { tr: "Haftanın / Sezonun Oyuncusu", en: "Player of the Week / Season" },
    desc: {
      tr: "Haftanın ve sezonun en iyi oyuncusunu seç, oyların yarışmasına katıl!",
      en: "Vote for the best player of the week and the season!",
    },
    statLine1: { tr: "Oylamaya katıl,", en: "Join the community vote," },
    statLine2: { tr: "yıldızını öne çıkar.", en: "back your star player." },
  },
  {
    key: "bil-kazan",
    icon: <IconTarget s={64} />,
    bg: "linear-gradient(150deg,#1eae6e,#0d5e3a)",
    photo: "/games/game-predict.jpg",
    live: true,
    title: { tr: "Bil Kazan", en: "Predict & Win" },
    desc: {
      tr: "Düellolarda hangi oyuncunun öne geçeceğini bil, puanları topla, ödülleri kazan!",
      en: "Predict which player comes out on top in duels, collect points and win prizes!",
    },
    statLine1: { tr: "Her hafta yeni düellolar,", en: "New duels every week," },
    statLine2: { tr: "Scores Puanı ödülleri.", en: "Scores Points rewards." },
  },
];

const STR = {
  tr: {
    subtitle: "Oyunlar",
    heroTitle: "Tahmin et, oyna, kazan!",
    heroText:
      "Scores TV oyunlarıyla futbol bilgini yarıştır: düellolarda tahmin yap, Scores Puanı topla, liderlik tablosunda yüksel.",
    playInApp: "Uygulamada Oyna",
    soon: "Yakında",
    liveBadge: "Uygulamada",
    lbTitle: "Scores Puanı Liderleri",
    lbSub: "Bil Kazan'da en çok puan toplayan oyuncular",
    lbRank: "#",
    lbPlayer: "Oyuncu",
    lbCoins: "Puan",
    lbHits: "İsabet",
    lbEmpty:
      "Liderlik tablosu şu an boş görünüyor — ilk sen katıl, adını buraya yazdır!",
    howTitle: "Nasıl Oynanır?",
    quickLb: "Sıralamalar",
    quickHow: "Nasıl Oynanır?",
    quickDl: "Uygulamayı İndir",
    ctaTitle: "Oyunlar şimdilik mobil uygulamada",
    ctaText:
      "Bil Kazan'ı hemen oynamak için uygulamayı indir. Yeni oyunlar çok yakında hem uygulamada hem web'de!",
  },
  en: {
    subtitle: "Games",
    heroTitle: "Predict, play, win!",
    heroText:
      "Put your football knowledge to the test with Scores TV games: make predictions in duels, collect Scores Points and climb the leaderboard.",
    playInApp: "Play in the App",
    soon: "Coming soon",
    liveBadge: "In the app",
    lbTitle: "Scores Points Leaders",
    lbSub: "Top point collectors in Predict & Win",
    lbRank: "#",
    lbPlayer: "Player",
    lbCoins: "Points",
    lbHits: "Hits",
    lbEmpty:
      "The leaderboard looks empty right now — be the first to join and put your name here!",
    howTitle: "How to Play?",
    quickLb: "Leaderboards",
    quickHow: "How to Play?",
    quickDl: "Get the App",
    ctaTitle: "Games are in the mobile app for now",
    ctaText:
      "Download the app to play Predict & Win right away. New games are coming very soon — both in the app and on the web!",
  },
} as const;

// Nasıl oynanır adımları — ikonlu, TR/EN.
const HOW_STEPS: {
  icon: React.ReactNode;
  t: { tr: string; en: string };
  d: { tr: string; en: string };
}[] = [
  {
    icon: <IconDownload s={30} />,
    t: { tr: "Uygulamayı indir", en: "Get the app" },
    d: {
      tr: "Scores TV uygulamasını App Store veya Google Play'den ücretsiz indir.",
      en: "Download the Scores TV app for free on the App Store or Google Play.",
    },
  },
  {
    icon: <IconTarget s={30} />,
    t: { tr: "Tahminini yap", en: "Make your prediction" },
    d: {
      tr: "Haftalık yarışmalardaki oyuncu düellolarında tahminini yap.",
      en: "Pick your side in the player duels of the weekly competitions.",
    },
  },
  {
    icon: <IconPoint s={30} />,
    t: { tr: "Puan topla, kazan", en: "Collect points & win" },
    d: {
      tr: "Doğru tahminlerle Scores Puanı kazan, liderlik tablosunda yüksel.",
      en: "Earn Scores Points with correct predictions and climb the leaderboard.",
    },
  },
];

export function GamesLanding({
  lang,
  leaderboard,
}: {
  lang: Lang;
  leaderboard: GameLeaderboardEntry[];
}) {
  const t = STR[lang];

  return (
    <div className={`gm-page ${barlowCondensed.variable}`}>
      {/* Hero */}
      <section className="gm-hero">
        <div className="gm-hero-kicker">
          <Logo h={22} />
          <span className="gm-kicker-dot">·</span>
          <span>{t.subtitle}</span>
        </div>
        <h1 className="gm-display gm-hero-title">{t.heroTitle}</h1>
        <p className="gm-hero-text">{t.heroText}</p>
      </section>

      {/* Oyun kartları */}
      <section className="gm-cards">
        {CARDS.map((c) => (
          <article key={c.key} className="gm-card" style={{ background: c.bg }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- public/ statik dekoratif foto */}
            <img src={c.photo} alt="" className="gm-card-photo" loading="lazy" />
            <div className="gm-card-shade" />
            <span className={`gm-card-badge${c.live ? " live" : ""}`}>
              {c.live ? t.liveBadge : t.soon}
            </span>
            <h2 className="gm-display gm-card-title">{c.title[lang]}</h2>
            <p className="gm-card-desc">{c.desc[lang]}</p>
            <div className="gm-card-foot">
              <div className="gm-card-stat">
                {c.statLine1[lang]}
                <br />
                <strong>{c.statLine2[lang]}</strong>
              </div>
              {c.live ? (
                <Link href={DOWNLOAD_PATH} className="gm-card-cta">
                  {t.playInApp}
                </Link>
              ) : (
                <span className="gm-card-cta soon">{t.soon}</span>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Hızlı linkler */}
      <nav className="gm-quick" aria-label={t.subtitle}>
        <a href="#siralamalar" className="gm-quick-item">
          <span className="gm-quick-ic">
            <IconBars s={26} />
          </span>
          <span>{t.quickLb}</span>
        </a>
        <a href="#nasil-oynanir" className="gm-quick-item">
          <span className="gm-quick-ic">
            <IconQuestion s={26} />
          </span>
          <span>{t.quickHow}</span>
        </a>
        <Link href={DOWNLOAD_PATH} className="gm-quick-item">
          <span className="gm-quick-ic">
            <IconDownload s={26} />
          </span>
          <span>{t.quickDl}</span>
        </Link>
      </nav>

      {/* Liderlik tablosu — backend'den canlı (global) */}
      <section id="siralamalar" className="gm-panel">
        <h2 className="gm-display gm-panel-title">
          <IconTrophy s={24} /> {t.lbTitle}
        </h2>
        <p className="gm-panel-sub">{t.lbSub}</p>
        {leaderboard.length > 0 ? (
          <div className="gm-lb-wrap">
            <table className="gm-lb">
              <thead>
                <tr>
                  <th className="r">{t.lbRank}</th>
                  <th>{t.lbPlayer}</th>
                  <th className="r">{t.lbCoins}</th>
                  <th className="r">{t.lbHits}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((e) => (
                  <tr key={e.userId}>
                    <td className="r">
                      <span
                        className={`gm-lb-rank${e.rank <= 3 ? ` medal p${e.rank}` : ""}`}
                      >
                        {e.rank}
                      </span>
                    </td>
                    <td className="gm-lb-name">{e.displayName}</td>
                    <td className="r tnum gm-lb-coins">
                      {e.coins.toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}
                    </td>
                    <td className="r tnum">
                      {e.correct}/{e.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="gm-lb-empty">{t.lbEmpty}</p>
        )}
      </section>

      {/* Nasıl oynanır */}
      <section id="nasil-oynanir" className="gm-panel">
        <h2 className="gm-display gm-panel-title">{t.howTitle}</h2>
        <div className="gm-how">
          {HOW_STEPS.map((s, i) => (
            <div key={s.t.en} className="gm-how-step">
              <span className="gm-how-num">{i + 1}</span>
              <span className="gm-how-ic">{s.icon}</span>
              <h3>{s.t[lang]}</h3>
              <p>{s.d[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Uygulama CTA */}
      <section className="gm-cta">
        <h2 className="gm-display gm-cta-title">{t.ctaTitle}</h2>
        <p className="gm-cta-text">{t.ctaText}</p>
        <StoreBadges className="gm-cta-badges" />
      </section>
    </div>
  );
}
