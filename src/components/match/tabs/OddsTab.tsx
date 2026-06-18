"use client";

import type { MatchDetailResponse } from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

/**
 * Bilyoner sponsor logosu — tek görsel (public/sponsors/bilyoner.png), her
 * temada gösterilir. (Ayrı koyu-tema görseli eklenirse tekrar tema ayrımı
 * yapılabilir; şimdilik tek dosya olduğu için sade tutuldu.)
 */
function SponsorLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/sponsors/bilyoner.png"
      alt="Bilyoner"
      className="odds-sponsor-logo"
    />
  );
}

export function OddsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const odds = detail.odds;

  if (!odds || !odds.markets || odds.markets.length === 0) {
    return (
      <div className="match-tab match-tab-odds">
        <section className="match-card">
          <p className="match-empty">
            {t(
              "Bu maç için iddaa oranı bulunmuyor",
              "No betting odds available for this match",
            )}
          </p>
        </section>
      </div>
    );
  }

  const link = odds.clickUrl || "https://www.bilyoner.com";

  return (
    <div className="match-tab match-tab-odds">
      {odds.markets.map((m, i) => (
        <section key={i} className="match-card odds-market-card">
          {/* Sol kolonda Bilyoner logosu (tikla bilyoner.com), sag kolonda
              market basligi + outcome'lar. */}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="odds-market-sponsor"
            aria-label="Bilyoner"
          >
            <SponsorLogo />
          </a>

          <div className="odds-market-body">
            <header className="odds-market-head">
              <h3>{m.name}</h3>
            </header>
            <div className="odds-outcomes">
              {m.outcomes.map((o, j) => (
                <a
                  key={j}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="odds-outcome"
                >
                  <span className="odds-outcome-label">{o.label}</span>
                  <span className="odds-outcome-value tnum">{o.odd}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      ))}

      <p className="odds-disclaimer">
        {t(
          "+18 — Bu içerik yetişkinler içindir. Oyun bağımlılığı zararlıdır. Oranlar Bilyoner'den alınmıştır, değişebilir.",
          "+18 — Adults only. Gambling can be addictive. Odds provided by Bilyoner and may change.",
        )}
      </p>
    </div>
  );
}
