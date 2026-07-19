"use client";

import { useEffect, useState } from "react";
import type { MatchDetailResponse } from "@/lib/match-detail-types";
import type { Highlight } from "@/lib/highlights-types";
import { IconPlay } from "@/components/icons";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
  /** SSR'da çekilen highlight listesi (varsa). Verilirse oynatıcı sunucu
   *  HTML'inde/ilk boyamada görünür olur — Google video indexleme için gerekli.
   *  Yine de istemcide ülkeye özgü embeddable için sessizce tazelenir. */
  initialItems?: Highlight[] | null;
}

export function HighlightsTab({ detail, lang, initialItems = null }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  // SSR verisi geldiyse onunla başla — client fetch beklemeden görünür.
  const [items, setItems] = useState<Highlight[] | null>(initialItems);
  const [loading, setLoading] = useState(initialItems == null);

  useEffect(() => {
    let aborted = false;
    const hadSsr = initialItems != null;
    if (!hadSsr) setLoading(true);
    // İstemcide ülkeye özgü embeddable için tazele. Boş dönerse SSR içeriğini
    // KORU (indeksleme + kullanıcı deneyimi bozulmasın).
    fetch(`/api/highlights/fixtures/${detail.id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((j: Highlight[]) => {
        if (aborted) return;
        const arr = Array.isArray(j) ? j : [];
        if (arr.length > 0 || !hadSsr) setItems(arr);
      })
      .catch(() => {
        if (!aborted && !hadSsr) setItems([]);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });
    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.id]);

  if (loading) {
    return (
      <section className="match-card">
        <p className="match-empty">{t("Yükleniyor...", "Loading...")}</p>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return (
      <section className="match-card">
        <p className="match-empty">
          {t(
            "Bu maç için henüz özet yok. Genelde maç bitiminden birkaç saat sonra eklenir.",
            "No highlights yet. They usually appear within a few hours after the match.",
          )}
        </p>
      </section>
    );
  }

  return (
    <div className="match-tab match-tab-highlights">
      <ul className="hl-list">
        {items.map((h, idx) => {
          // Backend, kullanıcının ülkesinde oynayabilecek highlight'ları
          // embeddable=true işaretler; yalnız onları iframe ile göm, gerisi
          // küçük-resim + "tarayıcıda aç" yedeği.
          const canEmbed = !!h.embeddable && !!h.embedUrl;
          return (
            <li key={h.id} className="hl-card">
              {canEmbed ? (
                <div className="hl-embed">
                  <iframe
                    src={h.embedUrl ?? undefined}
                    title={h.title}
                    // Birincil özet (JSON-LD ile eşleşen) eager yüklensin ki
                    // Googlebot lazy tetiklemese bile oynatıcıyı görsün.
                    loading={idx === 0 ? "eager" : "lazy"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hl-link"
                >
                  <span className="hl-thumb">
                    {h.imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={h.imgUrl} alt={h.title} loading="lazy" />
                    ) : null}
                    <span className="hl-play" aria-hidden="true">
                      <IconPlay s={22} />
                    </span>
                  </span>
                  <span className="hl-meta">
                    <span className="hl-title">{h.title}</span>
                    {h.source ? <span className="hl-src">{h.source}</span> : null}
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
