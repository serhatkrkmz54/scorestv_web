"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/context/favorites-context";
import { useLang } from "@/context/lang-context";
import {
  categorize,
  kickoffTime,
  liveClock,
  periodScore,
  statusLabelShort,
  winnerSide,
} from "@/lib/fixtures";
import type { FixtureSummary, FixtureTeam } from "@/lib/fixtures-types";
import { matchPath, teamPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconInfo, IconStadium, IconStar } from "@/components/icons";
import type { Lang } from "@/i18n/auth-strings";

// Takım adı + logosu → takım sayfasına slug linki (satır tıklamasını engelle).
// Kırmızı kart rozeti — küçük kırmızı kart; >1 ise yanında sayı.
function RedCardBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="mr-redcard" aria-label={`${count} kırmızı kart`}>
      <span className="mr-redcard-card" />
      {count > 1 ? <span className="mr-redcard-n">{count}</span> : null}
    </span>
  );
}

function TeamCell({
  team,
  side,
  lost,
  lang,
  redCards,
}: {
  team: FixtureTeam;
  side: "home" | "away";
  lost: boolean;
  lang: Lang;
  redCards: number;
}) {
  const cls = `mr-team ${side}` + (lost ? " lost" : "");
  const name = <span className="nm">{team.name}</span>;
  const logo = <TeamLogo name={team.name} logo={team.logo} size={26} />;
  const rc = redCards > 0 ? <RedCardBadge count={redCards} /> : null;
  const inner =
    side === "home" ? (
      <>
        {name}
        {rc}
        {logo}
      </>
    ) : (
      <>
        {logo}
        {rc}
        {name}
      </>
    );

  if (team.slug) {
    return (
      <Link href={teamPath(lang, team.slug)} className={cls} onClick={(e) => e.stopPropagation()}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function MatchRow({
  fixture,
  showLeague = false,
}: {
  fixture: FixtureSummary;
  showLeague?: boolean;
}) {
  const router = useRouter();
  const { lang } = useLang();
  const { has, toggle } = useFavorites();

  const cat = categorize(fixture.status);
  const isLive = cat === "live";
  const isUpcoming = cat === "upcoming";
  const winner = isUpcoming ? null : winnerSide(fixture.score);
  const fav = has(fixture.id);

  const homeLost = winner === "away";
  const awayLost = winner === "home";

  // Sol kolon: ana status etiketi (kısa) — canlıda dakika "90+1'".
  const minute = liveClock(fixture.status);
  // Status metni backend'den (longText): "Maç Bitti", "Devre Arası", "Penaltılarda Bitti"…
  // Canlı + dakikalı durumda dakika ("90+1'"). longText yoksa kısa etikete düş.
  const statusMain = isUpcoming
    ? kickoffTime(fixture.kickoff)
    : minute || fixture.status.longText || statusLabelShort(fixture.status, lang);
  // Mobilde dar status kolonuna sigmasi icin KISA etiket (longText degil).
  // Masaustunde tam metin gosterilir; ikisi CSS ile toggle edilir.
  const statusCompact = isUpcoming
    ? kickoffTime(fixture.kickoff)
    : minute || statusLabelShort(fixture.status, lang);

  // Uzatma / penaltı skorları → ikon tooltip'inde (sol kolonu kalabalık etmesin).
  const etTip = !isUpcoming
    ? periodScore(fixture.score.extraTime, lang === "tr" ? "Uzatma" : "Extra time")
    : null;
  const penTip = !isUpcoming
    ? periodScore(fixture.score.penalty, lang === "tr" ? "Penaltılar" : "Penalties")
    : null;
  const scoreTips = [etTip, penTip].filter((x): x is string => Boolean(x));

  // Orta: ana skorun altında ilk yarı.
  const htPrefix = lang === "tr" ? "İY" : "HT";
  const htLine = !isUpcoming ? periodScore(fixture.score.halftime, htPrefix) : null;

  const venueTitle = fixture.venue?.name
    ? fixture.venue.city
      ? `${fixture.venue.name} · ${fixture.venue.city}`
      : fixture.venue.name
    : undefined;

  const goMatch = () => router.push(matchPath(lang, fixture.slug));
  const statusKind = isLive ? "live" : isUpcoming ? "up" : "fin";

  return (
    <div
      className={"mrow" + (isLive ? " live" : "")}
      onClick={goMatch}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") goMatch();
      }}
    >
      {showLeague && fixture.leagueRef && (
        <div className="mrow-league">
          {fixture.leagueRef.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fixture.leagueRef.logo}
              alt=""
              className="mrow-league-logo"
              loading="lazy"
            />
          ) : null}
          <span className="mrow-league-name">{fixture.leagueRef.name}</span>
        </div>
      )}
      <div className="mrow-line">
        <div className={`mr-status ${statusKind}`}>
          <span className="st-main">
            {isLive && <span className="live-dot pulse" />}
            <span className="tnum st-full">{statusMain}</span>
            <span className="tnum st-compact">{statusCompact}</span>
          </span>
        </div>

        <TeamCell
          team={fixture.homeTeam}
          side="home"
          lost={homeLost}
          lang={lang}
          redCards={fixture.homeRedCards ?? 0}
        />

        {isUpcoming ? (
          <span className="mr-vs">VS</span>
        ) : (
          <div className="mr-score">
            <div className="sc-main tnum">
              <b className={homeLost ? "lose" : ""}>{fixture.score.home ?? 0}</b>
              <i>:</i>
              <b className={awayLost ? "lose" : ""}>{fixture.score.away ?? 0}</b>
            </div>
            {htLine && <span className="sc-ht tnum">{htLine}</span>}
          </div>
        )}

        <TeamCell
          team={fixture.awayTeam}
          side="away"
          lost={awayLost}
          lang={lang}
          redCards={fixture.awayRedCards ?? 0}
        />

        <div className="mr-end">
          {scoreTips.length > 0 && (
            <span
              className="cell-ic"
              aria-label={scoreTips.join(" · ")}
              onClick={(e) => e.stopPropagation()}
            >
              <IconInfo s={15} />
              <span className="cell-tip">
                {scoreTips.map((tip) => (
                  <span key={tip}>{tip}</span>
                ))}
              </span>
            </span>
          )}
          {venueTitle && (
            <span
              className="cell-ic"
              aria-label={venueTitle}
              onClick={(e) => e.stopPropagation()}
            >
              <IconStadium s={15} />
              <span className="cell-tip">
                <span>{venueTitle}</span>
              </span>
            </span>
          )}
          <button
            className={"iconbtn fav" + (fav ? " on" : "")}
            onClick={(e) => {
              e.stopPropagation();
              toggle(fixture.id);
            }}
            aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <IconStar s={17} fill={fav ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}
