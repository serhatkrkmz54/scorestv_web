"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lang } from "@/i18n/auth-strings";
import type { NewsListItem } from "@/lib/news-types";
import { categoryLabel, newsPath } from "@/lib/news-format";

/**
 * Haber slider'i — /haberler ust bandi. Otomatik gecis (5 sn, uzerine gelince
 * durur), ok + nokta gostergeleri, dokunmatik kaydirma. Sunucudan gelen
 * inSlider haberleri (sira + en yeni) gosterir.
 */
export default function NewsSlider({
  slides,
  lang,
}: {
  slides: NewsListItem[];
  lang: Lang;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n]);
  const next = useCallback(() => setIdx((p) => (p + 1) % n), [n]);
  const prev = useCallback(() => setIdx((p) => (p - 1 + n) % n), [n]);

  useEffect(() => {
    if (n <= 1 || paused) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % n), 5000);
    return () => clearInterval(id);
  }, [n, paused]);

  if (n === 0) return null;

  return (
    <section
      className="news-slider"
      aria-roledescription="carousel"
      aria-label={t("Öne çıkan haberler", "Featured news")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (dx > 40) prev();
        else if (dx < -40) next();
        touchX.current = null;
      }}
    >
      <div
        className="news-slider-track"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {slides.map((s) => (
          <Link key={s.id} href={newsPath(lang, s.slug)} className="news-slide">
            <div className="news-slide-cover">
              {s.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.coverImageUrl} alt="" />
              ) : (
                <span className="news-slide-cover-fb" />
              )}
              <div className="news-slide-overlay">
                <div className="news-slide-chips">
                  {s.isBreaking ? (
                    <span className="news-chip news-chip-breaking">
                      {t("Son Dakika", "Breaking")}
                    </span>
                  ) : (
                    <span className="news-chip news-chip-featured">
                      {t("Öne Çıkan", "Featured")}
                    </span>
                  )}
                  <span className="news-chip news-chip-cat">
                    {categoryLabel(s.category, lang)}
                  </span>
                </div>
                <h2 className="news-slide-title">{s.title}</h2>
                {s.summary ? (
                  <p className="news-slide-summary">{s.summary}</p>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            className="news-slider-arrow prev"
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            aria-label={t("Önceki", "Previous")}
          >
            ‹
          </button>
          <button
            type="button"
            className="news-slider-arrow next"
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            aria-label={t("Sonraki", "Next")}
          >
            ›
          </button>
          <div className="news-slider-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`news-slider-dot${i === idx ? " on" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(i);
                }}
                aria-label={`${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
