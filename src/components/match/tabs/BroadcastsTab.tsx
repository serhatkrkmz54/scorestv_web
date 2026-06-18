"use client";

import type { Broadcast } from "@/lib/broadcast-types";
import { localizedCountryName } from "@/lib/countries";

interface Props {
  broadcasts: Broadcast[];
  lang: "tr" | "en";
}

/**
 * "Yayınlar" sekmesi — maçı yayınlayan TV kanalları (TheSportsDB), ÜLKE ÜLKE
 * gruplanmış. Kullanıcının ülkesi (varsa) backend tarafından en üste alınır.
 * Veri MatchDetailScreen'de bir kez çekilip prop ile geçirilir.
 */
export function BroadcastsTab({ broadcasts, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  if (!broadcasts || broadcasts.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">
            {t(
              "Bu maç için yayın bilgisi bulunamadı.",
              "No broadcast info found for this match.",
            )}
          </p>
        </section>
      </div>
    );
  }

  // Ülkeye göre grupla — backend sırasını koru (kullanıcı ülkesi başta).
  const groups: { country: string; items: Broadcast[] }[] = [];
  const idx = new Map<string, number>();
  for (const b of broadcasts) {
    const key =
      b.country && b.country.length > 0
        ? localizedCountryName(b.country, lang)
        : t("Diğer", "Other");
    let gi = idx.get(key);
    if (gi === undefined) {
      gi = groups.length;
      idx.set(key, gi);
      groups.push({ country: key, items: [] });
    }
    groups[gi].items.push(b);
  }

  return (
    <div className="match-tab match-tab-broadcasts">
      {groups.map((g) => (
        <section key={g.country} className="bc-group">
          <header className="bc-group-head">
            <span className="bc-group-country">{g.country}</span>
            <span className="bc-group-count">{g.items.length}</span>
          </header>
          <ul className="bc-list">
            {g.items.map((b, i) => (
              <li key={`${b.channel}-${i}`} className="bc-row">
                <span className="bc-logo">
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt="" loading="lazy" />
                  ) : (
                    <span className="bc-logo-fallback">
                      {b.channel.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="bc-name">{b.channel}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
