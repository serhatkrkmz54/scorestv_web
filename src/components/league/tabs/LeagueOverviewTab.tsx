"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { teamPath, playerPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import {
  IconTrophy,
  IconBall,
  IconBars,
  IconHeart2,
  IconCard,
} from "@/components/icons";
import type {
  LeagueDetailResponse,
  LeagueTopPlayerView,
  LeagueTopRatedPlayer,
} from "@/lib/league-detail-types";
import type {
  MatchStandingRow,
  MatchStandingsGroup,
} from "@/lib/match-detail-types";

interface Props {
  detail: LeagueDetailResponse;
  lang: "tr" | "en";
}

// ──────────────────────────────────────────────────────────────────────
// Veri turetme yardimcilari
// ──────────────────────────────────────────────────────────────────────


// Uzun isim kisaltici: 3+ kelimeli isimleri bas harflerle ozetler
// (Amerika Birlesik Devletleri → ABD, Yesil Burun Adalari → YBA).
// 1-2 kelimeli ama uzun isimler degismez — CSS ellipsis devreye girer.
function shortenName(name: string | null | undefined, maxLen: number = 16): string {
  if (!name) return "";
  if (name.length <= maxLen) return name;
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return words.map((w) => w.charAt(0).toUpperCase()).join("");
  }
  return name;
}

function leaderTeam(standings: MatchStandingsGroup[]): MatchStandingRow | null {
  // Tek-grup lig: rank=1 takim. Cup/multi-grup: tum gruplar arasinda en yuksek puan.
  let best: MatchStandingRow | null = null;
  for (const g of standings) {
    for (const r of g.rows) {
      if (!best || r.points > best.points || (r.points === best.points && r.goalsDiff > best.goalsDiff)) {
        best = r;
      }
    }
  }
  return best;
}

interface SeasonMetrics {
  played: number;
  total: number;
  upcoming: number;
  totalGoals: number;
  goalsPerMatch: number;
  hasFixtures: boolean;
}

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

function seasonMetrics(detail: LeagueDetailResponse): SeasonMetrics {
  let played = 0;
  let total = 0;
  let totalGoals = 0;
  for (const r of detail.rounds ?? []) {
    for (const f of r.fixtures) {
      total++;
      if (FINISHED_STATUSES.has(f.status.shortCode ?? "")) {
        played++;
        if (f.score.home != null && f.score.away != null) {
          totalGoals += (f.score.home ?? 0) + (f.score.away ?? 0);
        }
      }
    }
  }
  const upcoming = total - played;
  const goalsPerMatch = played > 0 ? totalGoals / played : 0;
  return {
    played,
    total,
    upcoming,
    totalGoals,
    goalsPerMatch,
    hasFixtures: total > 0,
  };
}

function fmt(n: number, decimals = 0): string {
  if (decimals === 0) return n.toLocaleString("tr-TR");
  return n.toFixed(decimals).replace(".", ",");
}


// Sampiyonluk yarisi formu — standings-form pattern'le renkli pill.
function RaceFormPills({ form, lang }: { form: string; lang: "tr" | "en" }) {
  const letters = form.slice(-3).split("");
  return (
    <span className="standings-form lig-race-form">
      {letters.map((l, i) => {
        const cls =
          l === "W" ? "is-w" : l === "L" ? "is-l" : l === "D" ? "is-d" : "is-n";
        const display = lang === "tr"
          ? (l === "W" ? "G" : l === "D" ? "B" : l === "L" ? "M" : l)
          : l;
        return (
          <span key={i} className={`form-pill ${cls}`} title={l}>
            {display}
          </span>
        );
      })}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Stat kartlari
// ──────────────────────────────────────────────────────────────────────

function LeaderTeamCard({
  row,
  lang,
  t,
}: {
  row: MatchStandingRow | null;
  lang: "tr" | "en";
  t: (tr: string, en: string) => string;
}) {
  if (!row) return null;
  const inner = (
    <>
      <div className="lig-stat-head">
        <span className="lig-stat-icon"><IconTrophy s={14} /></span>
        <span className="lig-stat-title">{t("Lider", "Leader")}</span>
      </div>
      <div className="lig-stat-body lig-stat-body-team">
        <TeamLogo name={row.teamName} logo={row.teamLogo ?? null} size={34} />
        <div className="lig-stat-team-text">
          <span className="lig-stat-name" title={row.teamName}>{shortenName(row.teamName)}</span>
          <span className="lig-stat-sub">
            {row.played} {t("mac", "GP")} · {row.win}G {row.draw}B {row.lose}M
          </span>
        </div>
      </div>
      <div className="lig-stat-foot">
        <span className="lig-stat-bignum tnum">{row.points}</span>
        <span className="lig-stat-unit">{t("Puan", "Points")}</span>
      </div>
    </>
  );
  return row.teamSlug ? (
    <Link href={teamPath(lang, row.teamSlug)} className="lig-stat-card">{inner}</Link>
  ) : (
    <div className="lig-stat-card">{inner}</div>
  );
}

function TopPlayerCard({
  player,
  icon,
  title,
  unit,
  lang,
}: {
  player: LeagueTopPlayerView | null;
  icon: React.ReactNode;
  title: string;
  unit: string;
  lang: "tr" | "en";
}) {
  if (!player) return null;
  const name = player.playerName ?? "—";
  const photo = player.playerId
    ? `https://media.api-sports.io/football/players/${player.playerId}.png`
    : player.playerPhoto ?? null;
  const playerSlug = player.playerId
    ? buildEntitySlug(name, player.playerId)
    : null;
  const inner = (
    <>
      <div className="lig-stat-head">
        <span className="lig-stat-icon">{icon}</span>
        <span className="lig-stat-title">{title}</span>
      </div>
      <div className="lig-stat-body lig-stat-body-player">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name} className="lig-stat-photo" loading="lazy" />
        ) : (
          <span className="lig-stat-photo-fallback">
            {name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("")}
          </span>
        )}
        <div className="lig-stat-team-text">
          <span className="lig-stat-name" title={name}>{name}</span>
          {player.teamName ? (
            <span className="lig-stat-sub">
              {player.teamLogo ? (
                <TeamLogo name={player.teamName} logo={player.teamLogo} size={12} />
              ) : null}
              <span title={player.teamName ?? ""}>{shortenName(player.teamName)}</span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="lig-stat-foot">
        <span className="lig-stat-bignum tnum">{player.value ?? 0}</span>
        <span className="lig-stat-unit">{unit}</span>
      </div>
    </>
  );
  return playerSlug ? (
    <Link href={playerPath(lang, playerSlug)} className="lig-stat-card">{inner}</Link>
  ) : (
    <div className="lig-stat-card">{inner}</div>
  );
}

function TopRatedCard({
  player,
  lang,
  t,
}: {
  player: LeagueTopRatedPlayer | null;
  lang: "tr" | "en";
  t: (tr: string, en: string) => string;
}) {
  if (!player) return null;
  const name = player.playerName ?? "—";
  const photo = player.playerId
    ? `https://media.api-sports.io/football/players/${player.playerId}.png`
    : player.playerPhoto ?? null;
  const ratingNum =
    typeof player.rating === "number"
      ? player.rating
      : typeof player.rating === "string"
        ? parseFloat(player.rating)
        : 0;
  const ratingStr = isFinite(ratingNum) ? ratingNum.toFixed(2) : "—";
  const inner = (
    <>
      <div className="lig-stat-head">
        <span className="lig-stat-icon"><IconBars s={14} /></span>
        <span className="lig-stat-title">{t("En Yüksek Rating", "Top Rated")}</span>
      </div>
      <div className="lig-stat-body lig-stat-body-player">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name} className="lig-stat-photo" loading="lazy" />
        ) : (
          <span className="lig-stat-photo-fallback">
            {name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("")}
          </span>
        )}
        <div className="lig-stat-team-text">
          <span className="lig-stat-name" title={name}>{name}</span>
          {player.teamName ? (
            <span className="lig-stat-sub">
              {player.teamLogo ? (
                <TeamLogo name={player.teamName} logo={player.teamLogo} size={12} />
              ) : null}
              <span title={player.teamName ?? ""}>{shortenName(player.teamName)}</span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="lig-stat-foot">
        <span className="lig-stat-bignum tnum">{ratingStr}</span>
        <span className="lig-stat-unit">{t("Puan", "Rating")}</span>
      </div>
    </>
  );
  const playerSlug = player.playerSlug
    ?? (player.playerId ? buildEntitySlug(name, player.playerId) : null);
  return playerSlug ? (
    <Link href={playerPath(lang, playerSlug)} className="lig-stat-card">{inner}</Link>
  ) : (
    <div className="lig-stat-card">{inner}</div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Tablar — Sampiyonluk yarisi mini liste, sezon metrikleri, kunye
// ──────────────────────────────────────────────────────────────────────

function ChampionshipRaceCard({
  rows,
  lang,
  t,
}: {
  rows: MatchStandingRow[];
  lang: "tr" | "en";
  t: (tr: string, en: string) => string;
}) {
  const top = rows.slice(0, 5);
  if (top.length === 0) return null;
  const leaderPoints = top[0]?.points ?? 0;
  return (
    <section className="match-card">
      <header className="match-card-head">
        <h2>{t("Şampiyonluk Yarışı", "Title Race")}</h2>
      </header>
      <ul className="lig-race-list">
        {top.map((r, idx) => {
          const gap = leaderPoints - r.points;
          const rowInner = (
            <>
              <span className="lig-race-rank tnum">{r.rank}</span>
              <TeamLogo name={r.teamName} logo={r.teamLogo ?? null} size={22} />
              <span className="lig-race-name">{r.teamName}</span>
              {r.form ? <RaceFormPills form={r.form} lang={lang} /> : <span className="lig-race-form" />}
              <span className="lig-race-points tnum">{r.points}</span>
              <span className="lig-race-gap tnum">
                {gap === 0 ? t("Lider", "Top") : `-${gap}`}
              </span>
            </>
          );
          return (
            <li key={`${r.teamId}-${idx}`}>
              {r.teamSlug ? (
                <Link href={teamPath(lang, r.teamSlug)} className="lig-race-row">
                  {rowInner}
                </Link>
              ) : (
                <div className="lig-race-row">{rowInner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SeasonMetricsCard({
  m,
  t,
}: {
  m: SeasonMetrics;
  t: (tr: string, en: string) => string;
}) {
  if (!m.hasFixtures) return null;
  const pct = m.total > 0 ? Math.round((m.played / m.total) * 100) : 0;
  return (
    <section className="match-card">
      <header className="match-card-head">
        <h2>{t("Sezon Özeti", "Season Summary")}</h2>
      </header>
      <div className="lig-metric-grid">
        <div className="lig-metric">
          <span className="lig-metric-label">{t("Oynanan", "Played")}</span>
          <span className="lig-metric-value tnum">{fmt(m.played)}</span>
          <span className="lig-metric-sub">/ {fmt(m.total)} {t("mac", "matches")}</span>
        </div>
        <div className="lig-metric">
          <span className="lig-metric-label">{t("Toplam Gol", "Total Goals")}</span>
          <span className="lig-metric-value tnum">{fmt(m.totalGoals)}</span>
          <span className="lig-metric-sub">{t("bu sezon", "this season")}</span>
        </div>
        <div className="lig-metric">
          <span className="lig-metric-label">{t("Maç Başi Gol", "Goals / Match")}</span>
          <span className="lig-metric-value tnum">
            {m.played > 0 ? fmt(m.goalsPerMatch, 2) : "—"}
          </span>
          <span className="lig-metric-sub">{t("ortalama", "avg")}</span>
        </div>
        <div className="lig-metric">
          <span className="lig-metric-label">{t("Oynanacak", "Upcoming")}</span>
          <span className="lig-metric-value tnum">{fmt(m.upcoming)}</span>
          <span className="lig-metric-sub">{t("maç kaldı", "remaining")}</span>
        </div>
      </div>
      <div className="lig-progress">
        <div className="lig-progress-bar">
          <span className="lig-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="lig-progress-text">
          %{pct} {t("tamamlandı", "complete")}
        </span>
      </div>
    </section>
  );
}

function CupChampionCard({
  detail,
  lang,
  t,
}: {
  detail: LeagueDetailResponse;
  lang: "tr" | "en";
  t: (tr: string, en: string) => string;
}) {
  const champ = detail.bracket?.champion;
  if (!champ || !champ.teamId) return null;
  const inner = (
    <>
      <div className="lig-champ-icon"><IconTrophy s={28} /></div>
      <TeamLogo
        name={champ.teamName ?? "Şampiyon"}
        logo={champ.teamLogo ?? null}
        size={48}
      />
      <div className="lig-champ-text">
        <span className="lig-champ-title">{t("Şampiyon", "Champion")}</span>
        <span className="lig-champ-name">{champ.teamName ?? "—"}</span>
      </div>
    </>
  );
  return (
    <section className="match-card lig-champ-card">
      {champ.teamSlug ? (
        <Link href={teamPath(lang, champ.teamSlug)} className="lig-champ-row">
          {inner}
        </Link>
      ) : (
        <div className="lig-champ-row">{inner}</div>
      )}
    </section>
  );
}

function LeagueInfoCard({
  detail,
  t,
}: {
  detail: LeagueDetailResponse;
  t: (tr: string, en: string) => string;
}) {
  const season = detail.seasons.find(
    (s) => s.year === (detail.selectedSeason ?? detail.currentSeason),
  );
  return (
    <section className="match-card">
      <header className="match-card-head">
        <h2>{t("Lig Bilgileri", "League Info")}</h2>
      </header>
      <dl className="info-grid">
        <div className="info-row">
          <dt>{t("Ad", "Name")}</dt>
          <dd>{detail.name}</dd>
        </div>
        {detail.type ? (
          <div className="info-row">
            <dt>{t("Tip", "Type")}</dt>
            <dd>{detail.type}</dd>
          </div>
        ) : null}
        {detail.country?.name ? (
          <div className="info-row">
            <dt>{t("Ülke", "Country")}</dt>
            <dd>{detail.country.name}</dd>
          </div>
        ) : null}
        {detail.selectedSeason ?? detail.currentSeason ? (
          <div className="info-row">
            <dt>{t("Sezon", "Season")}</dt>
            <dd>{detail.selectedSeason ?? detail.currentSeason}</dd>
          </div>
        ) : null}
        {season?.startDate ? (
          <div className="info-row">
            <dt>{t("Başlangıç", "Start")}</dt>
            <dd>{season.startDate}</dd>
          </div>
        ) : null}
        {season?.endDate ? (
          <div className="info-row">
            <dt>{t("Bitiş", "End")}</dt>
            <dd>{season.endDate}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Ana bilesen
// ──────────────────────────────────────────────────────────────────────

export function LeagueOverviewTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const standings = detail.standings ?? [];
  const leader = leaderTeam(standings);
  const metrics = seasonMetrics(detail);

  // Sampiyonluk yarisi siralama mantigi:
  //   1) Standings icinde "Group Stage" pseudo-grup varsa (Dunya Kupasi gibi
  //      grup asamali turnuvalarda backend tum takimlari bu grupta tek tablo
  //      olarak doner) onu kullan — rank API tarafindan dogru hesaplanmis.
  //   2) Tek-grup lig (Premier Lig, Super Lig vb.) ise o grup.
  //   3) Cok grup ama "Group Stage" yoksa flatten + puan'a gore.
  const raceRows: MatchStandingRow[] = (() => {
    if (standings.length === 0) return [];
    const stage = standings.find(
      (g) => (g.groupName ?? "").toLowerCase() === "group stage",
    );
    if (stage) {
      return [...stage.rows].sort((a, b) => a.rank - b.rank);
    }
    if (standings.length === 1) {
      return [...standings[0].rows].sort((a, b) =>
        a.rank - b.rank || b.points - a.points,
      );
    }
    return standings
      .flatMap((g) => g.rows)
      .sort((a, b) => b.points - a.points || b.goalsDiff - a.goalsDiff);
  })();

  const topScorer = (detail.topScorers ?? [])[0] ?? null;
  const topAssist = (detail.topAssists ?? [])[0] ?? null;
  const topYellow = (detail.topYellowCards ?? [])[0] ?? null;
  const topRated = (detail.topRatedPlayers ?? [])[0] ?? null;

  return (
    <div className="match-tab">
      {/* Cup ise sampiyon bandi en ustte */}
      <CupChampionCard detail={detail} lang={lang} t={t} />

      {/* Hero stat grid — 4 buyuk kart */}
      <div className="lig-hero-stats">
        <LeaderTeamCard row={leader} lang={lang} t={t} />
        <TopPlayerCard
          player={topScorer}
          icon={<IconBall s={14} />}
          title={t("Gol Kralı", "Top Scorer")}
          unit={t("Gol", "Goals")}
          lang={lang}
        />
        <TopPlayerCard
          player={topAssist}
          icon={<IconHeart2 s={14} />}
          title={t("Asist Kralı", "Top Assists")}
          unit={t("Asist", "Assists")}
          lang={lang}
        />
        {topRated ? (
          <TopRatedCard player={topRated} lang={lang} t={t} />
        ) : topYellow ? (
          <TopPlayerCard
            player={topYellow}
            icon={<IconCard s={14} />}
            title={t("Sarı Kart Lideri", "Most Yellows")}
            unit={t("Sarı", "Yellows")}
            lang={lang}
          />
        ) : null}
      </div>

      {/* Sezon metrikleri */}
      <SeasonMetricsCard m={metrics} t={t} />

      {/* Sampiyonluk yarisi top 5 */}
      <ChampionshipRaceCard rows={raceRows} lang={lang} t={t} />

      {/* Lig kunyesi en altta */}
      <LeagueInfoCard detail={detail} t={t} />
    </div>
  );
}
