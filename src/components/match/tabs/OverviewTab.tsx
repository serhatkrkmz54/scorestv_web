"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { formatMinute } from "@/lib/match-format";
import { playerPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import type {
  MatchDetailResponse,
  MatchEvent,
} from "@/lib/match-detail-types";
import { PredictionCard } from "@/components/match/PredictionCard";

/** Oyuncu adi — id varsa oyuncu sayfasina link (dile gore slug), yoksa duz metin. */
function PlayerLink({
  name,
  id,
  lang,
  className,
}: {
  name: string;
  id?: number | null;
  lang: "tr" | "en";
  className: string;
}) {
  if (id != null && name && name !== "-") {
    return (
      <Link href={playerPath(lang, buildEntitySlug(name, id))} className={className}>
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

/**
 * Olay tipine (ve detayina) gore SVG ikonu + tema-uyumlu renk secer.
 * SVG'ler CSS mask olarak kullanilir: SEKIL dosyadan, RENK buradan gelir —
 * yani ikon hem dark hem light modda net gozukur (SVG'nin ic rengi onemsiz).
 * Dosyalar: public/events/<isim>.svg  ->  servis: /events/<isim>.svg
 */
function eventIconMeta(ev: MatchEvent): { src: string; tone: string; native?: boolean } {
  const type = (ev.type ?? "").toLowerCase();
  const detail = (ev.detail ?? "").toLowerCase();
  if (type === "goal") {
    // Kendi kalesine gol — kendi renkleriyle (mask yok), kirmiziya boyanmaz.
    if (detail.includes("own")) return { src: "/events/own-goal.svg", tone: "var(--text)", native: true };
    if (detail.includes("missed")) return { src: "/events/missed-penalty.svg", tone: "var(--text-faint)" };
    if (detail.includes("penalty")) return { src: "/events/penalty.svg", tone: "var(--text)" };
    return { src: "/events/goal.svg", tone: "var(--text)" };
  }
  if (type === "card") {
    if (detail.includes("red")) return { src: "/events/red-card.svg", tone: "var(--rel)" };
    return { src: "/events/yellow-card.svg", tone: "#f1c40f" };
  }
  if (type === "subst" || type === "substitution") {
    return { src: "/events/substitution.svg", tone: "var(--accent)" };
  }
  return { src: "/events/var.svg", tone: "var(--text-dim)" };
}

function eventIcon(ev: MatchEvent): ReactNode {
  const { src, tone, native } = eventIconMeta(ev);
  return (
    <span className="ev-ic">
      {native ? (
        // Kendi renkli SVG — mask uygulanmaz (orijinal haliyle gosterilir).
        // eslint-disable-next-line @next/next/no-img-element
        <img className="ev-ic-img" src={src} alt="" />
      ) : (
        <span
          className="ev-ic-glyph"
          style={{
            WebkitMaskImage: `url(${src})`,
            maskImage: `url(${src})`,
            backgroundColor: tone,
          }}
        />
      )}
    </span>
  );
}

/** Gol mu? (kacirilan penalti/iptal haric.) */
function isGoal(ev: MatchEvent): boolean {
  const type = (ev.type ?? "").toLowerCase();
  const detail = (ev.detail ?? "").toLowerCase();
  return type === "goal" && !detail.includes("missed");
}

type TimelineRow =
  | { kind: "event"; ev: MatchEvent; score: string | null; key: string }
  | { kind: "divider"; label: string; key: string };

/** Maç bittiyse gerçek sonuç ("HOME"/"DRAW"/"AWAY"), aksi halde null.
 *  PredictionCard kazanan satıra yeşil tik koymak için kullanır. */
function predictionResultChoice(
  detail: MatchDetailResponse,
): "HOME" | "DRAW" | "AWAY" | null {
  const sc = (detail.status?.shortCode ?? "").toUpperCase();
  if (!["FT", "AET", "PEN", "AWD", "WO"].includes(sc)) return null;
  const score = detail.score;
  if (!score) return null;
  let h: number | null | undefined;
  let a: number | null | undefined;
  if (sc === "PEN") {
    // Penaltıyla biten maçta kazananı penaltı serisi belirler.
    const pen = score.penalty;
    if (pen == null || pen.home == null || pen.away == null) return null;
    h = pen.home;
    a = pen.away;
  } else {
    h = score.home;
    a = score.away;
  }
  if (h == null || a == null) return null;
  if (h > a) return "HOME";
  if (a > h) return "AWAY";
  return "DRAW";
}

export function OverviewTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const { events: rawEvents, homeTeam } = detail;

  // Backend sirasi garanti degil — ascending sort (dakika + uzatma).
  const events = rawEvents
    ? [...rawEvents].sort((a, b) => {
        const am = (a.elapsed ?? 0) * 100 + (a.extra ?? 0);
        const bm = (b.elapsed ?? 0) * 100 + (b.extra ?? 0);
        return am - bm;
      })
    : [];

  if (events.length === 0) {
    return (
      <div className="match-tab match-tab-overview">
        <PredictionCard
          fixtureId={detail.id}
          homeName={detail.homeTeam.name}
          awayName={detail.awayTeam.name}
          lang={lang}
          resultChoice={predictionResultChoice(detail)}
        />
        <section className="match-card">
          <p className="match-empty">{t("Henüz olay yok", "No events yet")}</p>
        </section>
      </div>
    );
  }

  // Satirlari kur: olaylar arasina devre/uzatma ayraclari serpistir, gollerde
  // o ana kadarki skoru hesapla.
  const rows: TimelineRow[] = [];
  let h = 0;
  let a = 0;
  let htDone = false;
  let etDone = false;
  events.forEach((ev, i) => {
    const el = ev.elapsed ?? 0;
    if (!htDone && el > 45) {
      rows.push({ kind: "divider", label: t("Devre Arası", "Half Time"), key: "d-ht" });
      htDone = true;
    }
    if (!etDone && el > 90) {
      rows.push({ kind: "divider", label: t("Uzatmalar", "Extra Time"), key: "d-et" });
      etDone = true;
    }
    let score: string | null = null;
    if (isGoal(ev)) {
      const own = (ev.detail ?? "").toLowerCase().includes("own");
      const homeScored = own ? ev.teamId !== homeTeam.id : ev.teamId === homeTeam.id;
      if (homeScored) h += 1;
      else a += 1;
      score = `${h}–${a}`;
    }
    rows.push({
      kind: "event",
      ev,
      score,
      key: `${ev.elapsed ?? "?"}-${ev.type}-${ev.teamId}-${i}`,
    });
  });

  const finished = ["FT", "AET", "PEN"].includes(
    (detail.status?.shortCode ?? "").toUpperCase(),
  );
  if (finished) {
    rows.push({ kind: "divider", label: t("Maç Sonu", "Full Time"), key: "d-ft" });
  }

  return (
    <div className="match-tab match-tab-overview">
      <PredictionCard
        fixtureId={detail.id}
        homeName={detail.homeTeam.name}
        awayName={detail.awayTeam.name}
        lang={lang}
        resultChoice={predictionResultChoice(detail)}
      />
      <section className="match-card">
        <header className="match-card-head">
          <h3>{t("Maç Olayları", "Match Events")}</h3>
        </header>

        <ul className="evx-timeline">
          {rows.map((row) => {
            if (row.kind === "divider") {
              return (
                <li className="evx-divider" key={row.key}>
                  <span>{row.label}</span>
                </li>
              );
            }

            const { ev, score } = row;
            const isHome = ev.teamId === homeTeam.id;
            const type = (ev.type ?? "").toLowerCase();
            const isSub = type === "subst" || type === "substitution";
            const isGoalEv = type === "goal";
            const playerName = ev.playerName ?? "-";
            const assist = ev.assistName ?? null;
            const subText = ev.detailText ?? ev.typeText ?? ev.detail ?? ev.type;

            let body: ReactNode;
            if (isGoalEv) {
              // Gol: atan kalin + (asist) parantez icinde ince.
              body = (
                <span className="evx-sub-line">
                  <PlayerLink name={playerName} id={ev.playerId} lang={lang} className="evx-in" />
                  {assist ? (
                    <span className="evx-out">
                      (
                      <PlayerLink name={assist} id={ev.assistId} lang={lang} className="evx-out-link" />
                      )
                    </span>
                  ) : null}
                </span>
              );
            } else if (isSub) {
              // Degisiklik: giren kalin + cikan ince yan yana.
              body = (
                <span className="evx-sub-line">
                  <PlayerLink name={playerName} id={ev.playerId} lang={lang} className="evx-in" />
                  {assist ? (
                    <PlayerLink name={assist} id={ev.assistId} lang={lang} className="evx-out" />
                  ) : null}
                </span>
              );
            } else if (type === "card") {
              // Kart: sadece ikon + isim (Yellow/Red Card etiketi yazma).
              body = (
                <PlayerLink name={playerName} id={ev.playerId} lang={lang} className="evx-player" />
              );
            } else {
              // VAR / diger: oyuncu (varsa) + aciklama (orn. "Goal cancelled").
              body = (
                <>
                  {playerName && playerName !== "-" ? (
                    <PlayerLink name={playerName} id={ev.playerId} lang={lang} className="evx-player" />
                  ) : null}
                  {subText ? <span className="evx-label">{subText}</span> : null}
                </>
              );
            }

            // Ikon olayin SOLUNDA (merkezde degil) — metnin yaninda.
            const card = (
              <div className="evx-card">
                {eventIcon(ev)}
                <div className="evx-body">{body}</div>
              </div>
            );

            return (
              <li className={`evx-row is-${isHome ? "home" : "away"}`} key={row.key}>
                <div className="evx-side evx-left">{isHome ? card : null}</div>

                <div className="evx-center">
                  <span className="evx-min tnum">
                    {formatMinute(ev.elapsed, ev.extra) || "·"}
                  </span>
                  {score ? <span className="evx-score tnum">{score}</span> : null}
                </div>

                <div className="evx-side evx-right">{!isHome ? card : null}</div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
