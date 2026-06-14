"use client";

import { useMemo } from "react";
import { IconTrophy } from "@/components/icons";
import type {
  PlayerDetailResponse,
} from "@/lib/player-detail-types";

interface Props {
  detail: PlayerDetailResponse;
  lang: "tr" | "en";
}

function isWinner(place: string | null | undefined): boolean {
  if (!place) return false;
  const p = place.toLowerCase();
  return p.includes("winner") || p.includes("1st") || p.includes("şampiyon") || p.includes("sampiyon");
}

export function PlayerTrophiesTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const all = useMemo(() => detail.trophies ?? [], [detail.trophies]);

  // Lig + ulke + yer (place) bazinda topla: ayni turnuvanin kac kez kazanildigi.
  const grouped = useMemo(() => {
    type Acc = {
      league: string;
      leagueText: string | null;
      country: string | null;
      countryText: string | null;
      place: string;
      placeText: string | null;
      seasons: string[];
    };
    const map = new Map<string, Acc>();
    for (const tr of all) {
      const league = tr.leagueText ?? tr.league ?? "—";
      const country = tr.countryText ?? tr.country ?? "";
      const place = tr.placeText ?? tr.place ?? "—";
      const key = `${league}__${country}__${place}`;
      const exist = map.get(key);
      if (exist) {
        if (tr.season) exist.seasons.push(tr.season);
      } else {
        map.set(key, {
          league,
          leagueText: tr.leagueText ?? null,
          country: tr.country ?? null,
          countryText: tr.countryText ?? country,
          place,
          placeText: tr.placeText ?? null,
          seasons: tr.season ? [tr.season] : [],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const aw = isWinner(a.place) ? 1 : 0;
      const bw = isWinner(b.place) ? 1 : 0;
      if (aw !== bw) return bw - aw;
      return b.seasons.length - a.seasons.length;
    });
  }, [all]);

  if (all.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Kupa kaydi yok", "No trophies")}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="match-tab player-tab-trophies">
      <section className="match-card">
        <header className="match-card-head">
          <h3>
            <IconTrophy s={14} /> {t("Tum Kupalar", "All Trophies")}
          </h3>
        </header>
        <ul className="player-trophy-list">
          {grouped.map((g, i) => (
            <li key={i} className={`player-trophy-item ${isWinner(g.place) ? "is-winner" : ""}`}>
              <header className="player-trophy-row1">
                <span className="player-trophy-place">
                  {g.placeText ?? g.place}
                </span>
                <div className="player-trophy-title">
                  <span className="player-trophy-league">{g.league}</span>
                  {g.countryText ? (
                    <span className="player-trophy-country">{g.countryText}</span>
                  ) : null}
                </div>
                {g.seasons.length > 0 ? (
                  <span className="player-trophy-count tnum">×{g.seasons.length}</span>
                ) : null}
              </header>
              {g.seasons.length > 0 ? (
                <div className="player-trophy-chips">
                  {g.seasons.map((y, j) => (
                    <span key={j} className="player-trophy-chip tnum">{y}</span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
