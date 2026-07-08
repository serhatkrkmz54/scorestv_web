import Link from "next/link";
import type { Lang } from "@/i18n/auth-strings";
import type {
  NewsDetail,
  NewsEntityRef,
  NewsFixtureRef,
} from "@/lib/news-types";
import {
  teamPath,
  playerPath,
  leaguePath,
  countryPath,
  matchPath,
} from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import { formatNewsDate } from "@/lib/news-format";

type Kind = "team" | "player" | "league" | "country";

function EntityCard({
  entity,
  kind,
  label,
  href,
}: {
  entity: NewsEntityRef;
  kind: Kind;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="news-ec-card">
      <div className={`news-ec-logo${kind === "player" ? " round" : ""}`}>
        {entity.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entity.logo} alt="" />
        ) : (
          <span className="news-ec-logo-fb">{entity.name.charAt(0)}</span>
        )}
      </div>
      <div className="news-ec-body">
        <span className="news-ec-kind">{label}</span>
        <span className="news-ec-name">{entity.name}</span>
        {entity.subtitle ? (
          <span className="news-ec-sub">{entity.subtitle}</span>
        ) : null}
      </div>
      <span className="news-ec-go" aria-hidden="true">
        ›
      </span>
    </Link>
  );
}

function FixtureCard({ fx, lang }: { fx: NewsFixtureRef; lang: Lang }) {
  const hasScore = fx.homeGoals != null && fx.awayGoals != null;
  const inner = (
    <>
      <span className="news-ec-kind">{lang === "tr" ? "Maç" : "Match"}</span>
      <div className="news-ec-fx">
        <div className="news-ec-fx-team">
          {fx.homeLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fx.homeLogo} alt="" />
          ) : (
            <span className="news-ec-fx-fb" />
          )}
          <span className="news-ec-fx-nm">{fx.homeName}</span>
        </div>
        <div className="news-ec-fx-mid">
          {hasScore ? (
            <b>
              {fx.homeGoals} - {fx.awayGoals}
            </b>
          ) : (
            <span>{formatNewsDate(fx.kickoff, lang) || "vs"}</span>
          )}
          {fx.statusShort ? (
            <small className="news-ec-fx-st">{fx.statusShort}</small>
          ) : null}
        </div>
        <div className="news-ec-fx-team">
          {fx.awayLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fx.awayLogo} alt="" />
          ) : (
            <span className="news-ec-fx-fb" />
          )}
          <span className="news-ec-fx-nm">{fx.awayName}</span>
        </div>
      </div>
    </>
  );
  return fx.slug ? (
    <Link href={matchPath(lang, fx.slug)} className="news-ec-card news-ec-fxcard">
      {inner}
    </Link>
  ) : (
    <div className="news-ec-card news-ec-fxcard is-static">{inner}</div>
  );
}

/**
 * Habere bağlı varlıkların türe özel zengin kartları (sağ rail). Takım/oyuncu/
 * lig/ülke → logo/foto + isim + alt-bilgi + link; fikstür → iki takım + skor/tarih
 * + maça link. Bağlı varlık yoksa hiçbir şey render etmez.
 */
export function NewsEntityCards({
  detail,
  lang,
}: {
  detail: NewsDetail;
  lang: Lang;
}) {
  const teams = detail.teams ?? [];
  const players = detail.players ?? [];
  const leagues = detail.leagues ?? [];
  const countries = detail.countries ?? [];
  const fixtures = detail.fixtures ?? [];
  const total =
    teams.length +
    players.length +
    leagues.length +
    countries.length +
    fixtures.length;
  if (total === 0) return null;
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  return (
    <div className="news-ec">
      <div className="news-ec-title">{t("İlgili", "Related")}</div>
      {teams.map((e) => (
        <EntityCard
          key={`t${e.id}`}
          entity={e}
          kind="team"
          label={t("Takım", "Team")}
          href={teamPath(lang, buildEntitySlug(e.name, e.id))}
        />
      ))}
      {players.map((e) => (
        <EntityCard
          key={`p${e.id}`}
          entity={e}
          kind="player"
          label={t("Oyuncu", "Player")}
          href={playerPath(lang, buildEntitySlug(e.name, e.id))}
        />
      ))}
      {leagues.map((e) => (
        <EntityCard
          key={`l${e.id}`}
          entity={e}
          kind="league"
          label={t("Lig", "League")}
          href={leaguePath(lang, buildEntitySlug(e.name, e.id))}
        />
      ))}
      {countries.map((e) => (
        <EntityCard
          key={`c${e.id}`}
          entity={e}
          kind="country"
          label={t("Ülke", "Country")}
          href={countryPath(lang, buildEntitySlug(e.name, e.id))}
        />
      ))}
      {fixtures.map((fx) => (
        <FixtureCard key={`f${fx.id}`} fx={fx} lang={lang} />
      ))}
    </div>
  );
}
