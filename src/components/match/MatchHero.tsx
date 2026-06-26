"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { CountryFlag } from "@/components/shell/CountryFlag";
import { leaguePath, teamPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import type {
  MatchDetailResponse,
  MatchScore,
  MatchStatus,
} from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"]);
const FT_STATUSES = new Set(["FT", "AET", "PEN"]);
const IN_PLAY_STATUSES = new Set(["1H", "2H", "ET", "LIVE", "P"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

function isLive(status: MatchStatus): boolean {
  return LIVE_STATUSES.has(status.shortCode);
}

function formatKickoff(iso: string, lang: "tr" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function statusDisplayText(
  status: MatchStatus,
  kickoff: string,
  lang: "tr" | "en",
): string {
  const code = status.shortCode;
  const tr = lang === "tr";
  if (IN_PLAY_STATUSES.has(code)) {
    if (status.elapsed != null) {
      const base = `${status.elapsed}`;
      const extra = status.extra ? `+${status.extra}` : "";
      return `${base}${extra}'`;
    }
    return status.longText ?? "";
  }
  if (code === "HT") return tr ? "Devre Arası" : "Half Time";
  if (code === "BT") return tr ? "Ara" : "Break";
  if (code === "INT") return tr ? "Maç Durdu" : "Interrupted";
  if (code === "FT") return tr ? "Maç Bitti" : "Full Time";
  if (code === "AET") return tr ? "Uzatmalarda Bitti" : "After Extra Time";
  if (code === "PEN") return tr ? "Penaltılarda Bitti" : "Won on Penalties";
  if (code === "CANC") return tr ? "Iptal" : "Cancelled";
  if (code === "ABD") return tr ? "Yarıda Kaldı" : "Abandoned";
  if (code === "PST") return tr ? "Ertelendi" : "Postponed";
  if (code === "AWD") return tr ? "Hükmen" : "Awarded";
  if (code === "WO") return tr ? "Hükmen Galip" : "Walkover";
  if (code === "SUSP") return tr ? "Askıya Alındı" : "Suspended";
  if (code === "NS" || code === "TBD") return formatKickoff(kickoff, lang);
  return status.longText ?? code;
}

/**
 * Mobile ile ayni periyot seridi: IY / MS / Uzt / Pen.
 * - IY: halftime varsa
 * - Uzt: AET/PEN ya da extraTime varsa
 * - MS: bitti + IY var + uzatma YOK (uzatmaya gitmediyse MS chip'i goster)
 * - Pen: penaltyVarsa
 */
function ScoreBreakdown({
  score,
  status,
  lang,
}: {
  score: MatchScore;
  status: MatchStatus;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const code = status.shortCode;
  const finished = FINISHED_STATUSES.has(code);
  const ht = score.halftime;
  const htOk = ht && ht.home != null && ht.away != null;
  const et = score.extraTime;
  const etOk = et && et.home != null && et.away != null;
  const pen = score.penalty;
  const penOk = pen && pen.home != null && pen.away != null;
  const wentToExtra = code === "AET" || code === "PEN" || !!etOk;
  const hasPenalties = code === "PEN" || !!penOk;

  type Seg = { label: string; value: string; active?: boolean };
  const items: Seg[] = [];

  // IY
  if (htOk) {
    items.push({
      label: t("İY", "HT"),
      value: `${ht!.home}-${ht!.away}`,
    });
  }

  // Uzt VEYA MS — uzatma oynandiysa Uzt, yoksa MS (bitmis macta IY varsa)
  if (wentToExtra && etOk) {
    items.push({
      label: t("Uzt", "ET"),
      value: `${et!.home}-${et!.away}`,
      active: code === "AET",
    });
  } else if (
    finished &&
    htOk &&
    score.home != null &&
    score.away != null
  ) {
    items.push({
      label: t("MS", "FT"),
      value: `${score.home}-${score.away}`,
    });
  }

  // Pen
  if (hasPenalties && penOk) {
    items.push({
      label: "Pen",
      value: `${pen!.home}-${pen!.away}`,
      active: code === "PEN",
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="match-hero-breakdown" aria-label="Periyot skorlari">
      {items.map((it, i) => (
        <span
          key={i}
          className={`match-hero-period ${it.active ? "is-active" : ""}`}
        >
          <span className="match-hero-period-label">{it.label}</span>
          <span className="match-hero-period-value tnum">{it.value}</span>
        </span>
      ))}
    </div>
  );
}

export function MatchHero({ detail, lang }: Props) {
  const { homeTeam, awayTeam, score, status, league, round, kickoff } = detail;
  const live = isLive(status);
  const finished = FT_STATUSES.has(status.shortCode);
  const showScore =
    (live || finished) && score.home != null && score.away != null;
  const statusText = statusDisplayText(status, kickoff, lang);
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  // Kırmızı kart sayıları — maç olaylarından (type 'Card' + detail 'red').
  const redCount = (teamId: number) =>
    (detail.events ?? []).filter(
      (e) =>
        e.teamId === teamId &&
        e.type?.toLowerCase() === "card" &&
        (e.detail ?? "").toLowerCase().includes("red"),
    ).length;
  const homeReds = redCount(homeTeam.id);
  const awayReds = redCount(awayTeam.id);

  return (
    <section className="match-hero">
      <div className="match-hero-bg" aria-hidden>
        {league.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={league.logo} alt="" className="match-hero-bg-logo" />
        ) : null}
        <div className="match-hero-bg-gradient" />
      </div>

      <div className="match-hero-content">
        <div className="match-hero-meta">
          <Link
            href={leaguePath(lang, league.slug ?? buildEntitySlug(league.name, league.id))}
            className="match-hero-league"
          >
            {league.countryFlag || league.country ? (
              <CountryFlag
                flag={league.countryFlag ?? null}
                country={league.country ?? ""}
                size={14}
              />
            ) : null}
            <span className="match-hero-league-name">{league.name}</span>
          </Link>
          {round ? <span className="match-hero-round">{round}</span> : null}
        </div>

        <div className="match-hero-main">
          <Link
            href={teamPath(lang, homeTeam.slug ?? buildEntitySlug(homeTeam.name, homeTeam.id))}
            className="match-hero-team match-hero-team-home"
          >
            <TeamLogo name={homeTeam.name} logo={homeTeam.logo ?? null} size={64} />
            <span className="match-hero-team-name">{homeTeam.name}</span>
            {homeReds > 0 ? (
              <span className="match-hero-redcard" aria-label={`${homeReds} kırmızı kart`}>
                <span className="match-hero-redcard-card" />
                {homeReds > 1 ? (
                  <span className="match-hero-redcard-n">{homeReds}</span>
                ) : null}
              </span>
            ) : null}
          </Link>

          <div className="match-hero-center">
            {live ? (
              <div className="match-hero-live">
                <span className="match-hero-pulse" aria-hidden />
                <span className="match-hero-live-text">{statusText}</span>
              </div>
            ) : (
              <div className="match-hero-status">{statusText}</div>
            )}

            {showScore ? (
              <div
                className={`match-hero-score tnum ${live ? "is-live" : ""}`}
                aria-live="polite"
              >
                <span>{score.home}</span>
                <span className="match-hero-score-sep">-</span>
                <span>{score.away}</span>
              </div>
            ) : (
              <div className="match-hero-vs">{t("vs", "vs")}</div>
            )}

            <ScoreBreakdown score={score} status={status} lang={lang} />
          </div>

          <Link
            href={teamPath(lang, awayTeam.slug ?? buildEntitySlug(awayTeam.name, awayTeam.id))}
            className="match-hero-team match-hero-team-away"
          >
            <TeamLogo name={awayTeam.name} logo={awayTeam.logo ?? null} size={64} />
            <span className="match-hero-team-name">{awayTeam.name}</span>
            {awayReds > 0 ? (
              <span className="match-hero-redcard" aria-label={`${awayReds} kırmızı kart`}>
                <span className="match-hero-redcard-card" />
                {awayReds > 1 ? (
                  <span className="match-hero-redcard-n">{awayReds}</span>
                ) : null}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </section>
  );
}
