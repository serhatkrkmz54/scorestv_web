"use client";

import { TeamLogo } from "@/components/shell/TeamLogo";
import type { MatchDetailResponse, MatchStatus } from "@/lib/match-detail-types";

const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"]);
const IN_PLAY_STATUSES = new Set(["1H", "2H", "ET", "LIVE", "P"]);
const FT_STATUSES = new Set(["FT", "AET", "PEN"]);

// Kompakt bar icin kisa durum/dakika metni. Canli ise 45' / 45+2', bitmis ise
// MS/UZT/PEN, oynanmamis ise baslama saati.
function shortStatus(
  status: MatchStatus,
  kickoff: string,
  lang: "tr" | "en",
): string {
  const code = status.shortCode;
  const tr = lang === "tr";
  if (IN_PLAY_STATUSES.has(code) && status.elapsed != null) {
    return `${status.elapsed}${status.extra ? `+${status.extra}` : ""}'`;
  }
  if (code === "HT") return tr ? "İY" : "HT";
  if (code === "BT") return tr ? "Ara" : "Break";
  if (code === "FT") return tr ? "MS" : "FT";
  if (code === "AET") return tr ? "UZT" : "AET";
  if (code === "PEN") return "PEN";
  if (code === "NS" || code === "TBD") {
    try {
      return new Intl.DateTimeFormat(tr ? "tr-TR" : "en-US", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(kickoff));
    } catch {
      return "";
    }
  }
  return status.longText ?? code;
}

/**
 * Maç detayında hero ekrandan çıkınca sabitlenen (sticky) kompakt skor barı.
 * Eski sabit tab şeridinin yerini alır — kullanıcı aşağı inince takımlar ve
 * skor üstte kalır. Görünürlük {@code visible} ile MatchDetailScreen'den
 * (IntersectionObserver) kontrol edilir.
 */
export function MatchStickyScore({
  detail,
  lang,
  visible,
}: {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
  visible: boolean;
}) {
  const { homeTeam, awayTeam, score, status, kickoff } = detail;
  const live = LIVE_STATUSES.has(status.shortCode);
  const finished = FT_STATUSES.has(status.shortCode);
  const showScore =
    (live || finished) && score.home != null && score.away != null;
  const centerText = shortStatus(status, kickoff, lang);

  return (
    <div
      className={`match-sticky-score ${visible ? "is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="mss-team mss-home">
        <span className="mss-name">{homeTeam.name}</span>
        <TeamLogo name={homeTeam.name} logo={homeTeam.logo ?? null} size={26} />
      </div>

      <div className="mss-center">
        {live ? <span className="mss-dot" aria-hidden /> : null}
        {showScore ? (
          <span className={`mss-score tnum ${live ? "is-live" : ""}`}>
            <span>{score.home}</span>
            <span className="mss-sep">-</span>
            <span>{score.away}</span>
          </span>
        ) : (
          <span className="mss-vs">{centerText || "vs"}</span>
        )}
        {live && centerText ? <span className="mss-min">{centerText}</span> : null}
      </div>

      <div className="mss-team mss-away">
        <TeamLogo name={awayTeam.name} logo={awayTeam.logo ?? null} size={26} />
        <span className="mss-name">{awayTeam.name}</span>
      </div>
    </div>
  );
}
