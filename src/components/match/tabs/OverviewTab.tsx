"use client";

import type { ReactNode } from "react";
import { formatMinute } from "@/lib/match-format";
import {
  IconBall,
  IconCard,
  IconSwap,
  IconWhistle,
} from "@/components/icons";
import type {
  MatchDetailResponse,
  MatchEvent,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

function eventIcon(ev: MatchEvent): ReactNode {
  const type = (ev.type ?? "").toLowerCase();
  const detail = (ev.detail ?? "").toLowerCase();
  if (type === "goal") {
    if (detail.includes("own goal")) {
      return <span className="ev-ic ev-ic-own"><IconBall s={14} /></span>;
    }
    if (detail.includes("missed")) {
      return <span className="ev-ic ev-ic-miss"><IconBall s={14} /></span>;
    }
    return <span className="ev-ic ev-ic-goal"><IconBall s={14} /></span>;
  }
  if (type === "card") {
    if (detail.includes("red")) {
      return <span className="ev-ic ev-ic-red"><IconCard s={12} /></span>;
    }
    return <span className="ev-ic ev-ic-yellow"><IconCard s={12} /></span>;
  }
  if (type === "subst" || type === "substitution") {
    return <span className="ev-ic ev-ic-sub"><IconSwap s={13} /></span>;
  }
  if (type === "var") {
    return <span className="ev-ic ev-ic-var"><IconWhistle s={13} /></span>;
  }
  return <span className="ev-ic"><IconWhistle s={13} /></span>;
}

export function OverviewTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const { events: rawEvents, homeTeam } = detail;
  // Backend sirasi garanti degil — savunmaci olarak ascending sort.
  // Yeni gelen WS event'i de dogru dakikada (en altta) gozuksun.
  const events = rawEvents
    ? [...rawEvents].sort((a, b) => {
        const am = (a.elapsed ?? 0) * 100 + (a.extra ?? 0);
        const bm = (b.elapsed ?? 0) * 100 + (b.extra ?? 0);
        return am - bm;
      })
    : [];
  const hasEvents = events.length > 0;

  if (!hasEvents) {
    return (
      <div className="match-tab match-tab-overview">
        <section className="match-card">
          <p className="match-empty">{t("Henuz olay yok", "No events yet")}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="match-tab match-tab-overview">
      <section className="match-card">
        <header className="match-card-head">
          <h3>{t("Mac Olaylari", "Match Events")}</h3>
        </header>
        <ul className="event-timeline">
          {events.map((ev, i) => {
            const isHome = ev.teamId === homeTeam.id;
            const side: "home" | "away" = isHome ? "home" : "away";
            const playerName = ev.playerName ?? "-";
            const subText = ev.detailText ?? ev.typeText ?? ev.detail ?? ev.type;
            const assist = ev.assistName ?? null;
            return (
              <li
                key={`${ev.elapsed ?? "?"}-${ev.type}-${ev.teamId}-${i}`}
                className={`event-row is-${side}`}
              >
                <div className="event-side event-side-home">
                  {isHome ? (
                    <div className="event-cell">
                      {eventIcon(ev)}
                      <div className="event-text">
                        <span className="event-player">{playerName}</span>
                        {assist ? (
                          <span className="event-assist">
                            {t("Asist", "Assist")}: {assist}
                          </span>
                        ) : null}
                        {subText && subText !== playerName ? (
                          <span className="event-label">{subText}</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="event-minute tnum">
                  {formatMinute(ev.elapsed, ev.extra) || "·"}
                </div>

                <div className="event-side event-side-away">
                  {!isHome ? (
                    <div className="event-cell">
                      <div className="event-text">
                        <span className="event-player">{playerName}</span>
                        {assist ? (
                          <span className="event-assist">
                            {t("Asist", "Assist")}: {assist}
                          </span>
                        ) : null}
                        {subText && subText !== playerName ? (
                          <span className="event-label">{subText}</span>
                        ) : null}
                      </div>
                      {eventIcon(ev)}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
