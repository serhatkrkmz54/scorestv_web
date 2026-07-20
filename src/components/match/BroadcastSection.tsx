"use client";

import { useEffect, useState } from "react";
import type { Broadcast } from "@/lib/broadcast-types";

interface Props {
  fixtureId: number;
  lang: "tr" | "en";
}

/**
 * "Nerede izlenir" — maçı yayınlayan TV kanalları (TheSportsDB). Veri yoksa
 * bölüm sessizce gizlenir (her maçta yayın bilgisi bulunmaz).
 */
export function BroadcastSection({ fixtureId, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [items, setItems] = useState<Broadcast[] | null>(null);

  useEffect(() => {
    let aborted = false;
    fetch(`/api/broadcasts/fixtures/${fixtureId}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((j: Broadcast[]) => {
        if (!aborted) setItems(Array.isArray(j) ? j : []);
      })
      .catch(() => {
        if (!aborted) setItems([]);
      });
    return () => {
      aborted = true;
    };
  }, [fixtureId]);

  // Yükleniyor (null) ya da boş → bölümü gösterme.
  if (!items || items.length === 0) return null;

  return (
    <section className="match-card bc-card">
      <header className="match-card-head">
        <h2>{t("Nerede izlenir", "Where to watch")}</h2>
      </header>
      <ul className="bc-list">
        {items.map((b, i) => (
          <li className="bc-row" key={`${b.channel}-${b.country ?? ""}-${i}`}>
            <span className="bc-logo">
              {b.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.logoUrl} alt={b.channel} loading="lazy" />
              ) : (
                <span className="bc-logo-fallback">
                  {b.channel.slice(0, 1).toUpperCase()}
                </span>
              )}
            </span>
            <span className="bc-name">{b.channel}</span>
            {b.country ? <span className="bc-country">{b.country}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
