"use client";

import { useEffect, useState } from "react";
import type { MatchDetailResponse } from "@/lib/match-detail-types";
import type { Highlight } from "@/lib/highlights-types";
import { IconPlay } from "@/components/icons";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

export function HighlightsTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [items, setItems] = useState<Highlight[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    setLoading(true);
    fetch(`/api/highlights/fixtures/${detail.id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((j: Highlight[]) => {
        if (!aborted) setItems(Array.isArray(j) ? j : []);
      })
      .catch(() => {
        if (!aborted) setItems([]);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });
    return () => {
      aborted = true;
    };
  }, [detail.id]);

  if (loading) {
    return (
      <section className="match-card">
        <p className="match-empty">{t("Yukleniyor...", "Loading...")}</p>
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
        {items.map((h) => {
          const canEmbed = !!h.embeddable && !!h.embedUrl;
          return (
            <li key={h.id} className="hl-card">
              {canEmbed ? (
                <div className="hl-embed-wrap">
                  <div className="hl-embed">
                    <iframe
                      src={h.embedUrl ?? undefined}
                      title={h.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <div className="hl-embed-meta">
                    <span className="hl-title">{h.title}</span>
                    <a
                      className="hl-ext"
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("Tarayıcıda aç", "Open in browser")}
                    </a>
                  </div>
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
