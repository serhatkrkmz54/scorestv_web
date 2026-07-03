import type { Metadata } from "next";
import Link from "next/link";
import { resolveLang } from "@/lib/lang-server";
import { fetchTvGuideServer, type TvGuideResponse } from "@/lib/tv-guide";
import { LeftRail } from "@/components/home/LeftRail";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { matchPath, leaguePath } from "@/lib/routes";
import { formatKickoffShort } from "@/lib/match-format";
import type { Lang } from "@/i18n/auth-strings";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";
const TZ = "Europe/Istanbul"; // backend gun sinirlariyla ayni saat dilimi.

// Gun paramli sayfalar da base'e canonical — tek URL, cok-gun icerik.
const CANONICAL = `${SITE}/canli-mac-programi`;

// Bugun + sonraki 7 gun (toplam 8) icin ISO tarih (yyyy-MM-dd) listesi.
// Istanbul saat dilimine gore hesaplanir (backend ile ayni gun siniri).
function isoInTz(d: Date): string {
  // en-CA "YYYY-MM-DD" verir; timeZone ile Istanbul gunu.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function weekDays(): string[] {
  const out: string[] = [];
  const now = Date.now();
  for (let i = 0; i < 8; i++) {
    out.push(isoInTz(new Date(now + i * 86400000)));
  }
  return out;
}

// Gun sekmesi etiketi: Bugun / Yarin / "5 Tem" (dile gore).
function dayLabel(iso: string, days: string[], lang: Lang): string {
  if (iso === days[0]) return lang === "tr" ? "Bugün" : "Today";
  if (iso === days[1]) return lang === "tr" ? "Yarın" : "Tomorrow";
  // Ogleden dogru: iso'yu Istanbul gun ortasinda tarihe cevir, gun+ay bas.
  const dt = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
  }).format(dt);
}

// Secili gunun basligi (H1 ve giris icin): Bugun / Yarin / uzun tarih.
function selectedHeading(iso: string, days: string[], lang: Lang): string {
  if (iso === days[0]) return lang === "tr" ? "Bugün" : "Today";
  if (iso === days[1]) return lang === "tr" ? "Yarın" : "Tomorrow";
  const dt = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).format(dt);
}

interface PageProps {
  searchParams: Promise<{ gun?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await resolveLang();
  const title =
    lang === "tr"
      ? "Canlı Maç Programı — Bugün Hangi Maçlar, Hangi Kanalda? | Scores TV"
      : "Live Match Schedule — Today's Football on TV | Scores TV";
  const description =
    lang === "tr"
      ? "Bugün ve bu hafta hangi futbol maçları var, saat kaçta ve hangi kanalda? Günlük canlı maç programı, yayıncı kanallar ve maç saatleri tek sayfada — Scores TV."
      : "Which football matches are on today and this week — what time and on which channel? Daily live match schedule with broadcasters and kickoff times on one page — Scores TV.";
  return {
    title,
    description,
    alternates: {
      canonical: CANONICAL,
      languages: {
        tr: `${CANONICAL}?lang=tr`,
        en: `${CANONICAL}?lang=en`,
        "x-default": CANONICAL,
      },
    },
    openGraph: {
      title,
      description,
      url: CANONICAL,
      images: [{ url: `${SITE}/og-image.png` }],
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE}/og-image.png`],
    },
  };
}

// Secili gunun maclari icin ItemList (her item SportsEvent ozeti).
function itemListJsonLd(data: TvGuideResponse, lang: Lang): string {
  const items: Record<string, unknown>[] = [];
  let pos = 1;
  for (const lg of data.leagues) {
    for (const m of lg.matches) {
      const url = `${SITE}${matchPath(lang, m.slug)}`;
      const ev: Record<string, unknown> = {
        "@type": "SportsEvent",
        name: `${m.homeName} vs ${m.awayName}`,
        url,
      };
      if (m.kickoff) ev.startDate = m.kickoff;
      items.push({ "@type": "ListItem", position: pos++, item: ev });
    }
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      lang === "tr"
        ? "Canlı Maç Programı"
        : "Live Match Schedule",
    numberOfItems: items.length,
    itemListElement: items,
  });
}

export default async function Page({ searchParams }: PageProps) {
  const lang = await resolveLang();
  const days = weekDays();
  const sp = await searchParams;
  const selected = sp.gun && days.includes(sp.gun) ? sp.gun : days[0];

  const data = await fetchTvGuideServer(selected, lang);
  const heading = selectedHeading(selected, days, lang);

  const h1 =
    lang === "tr"
      ? "Bugün Hangi Maçlar Var, Hangi Kanalda? — Canlı Maç Programı"
      : "Today's Football on TV — Live Match Schedule";
  const intro =
    lang === "tr"
      ? "Günlük canlı maç programı: seçtiğiniz gün hangi futbol maçları var, saat kaçta başlıyor ve hangi kanalda yayınlanıyor. Ligleri ve yayıncı kanalları aşağıda görebilirsiniz."
      : "Daily live match schedule: which football matches are on your selected day, what time they kick off and which channel broadcasts them. Browse leagues and broadcasters below.";

  const noMatch =
    lang === "tr" ? "Bu güne ait maç bulunamadı." : "No matches for this day.";
  const channelLabel = lang === "tr" ? "Kanal" : "Channel";

  return (
    <>
      {data && data.leagues.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: itemListJsonLd(data, lang) }}
        />
      ) : null}
      <div className="layout">
        <aside className="rail-left">
          <LeftRail />
        </aside>
        <main className="tvguide-main">
          <header className="tvg-head">
            <h1 className="tvg-h1">{h1}</h1>
            <p className="tvg-intro">{intro}</p>
          </header>

          {/* Gun sekmeleri: bugun + 7 gun. Secili gun ?gun= ile. */}
          <nav className="tvg-days" aria-label={lang === "tr" ? "Gün seçimi" : "Day selection"}>
            {days.map((d) => {
              const isBase = d === days[0];
              const href = isBase
                ? "/canli-mac-programi"
                : `/canli-mac-programi?gun=${d}`;
              return (
                <Link
                  key={d}
                  href={href}
                  className={"tvg-day" + (d === selected ? " on" : "")}
                  aria-current={d === selected ? "date" : undefined}
                >
                  {dayLabel(d, days, lang)}
                </Link>
              );
            })}
          </nav>

          <div className="tvg-sub">{heading}</div>

          {!data || data.leagues.length === 0 ? (
            <p className="tvg-empty">{noMatch}</p>
          ) : (
            <div className="tvg-leagues">
              {data.leagues.map((lg) => (
                <section key={lg.slug} className="tvg-league">
                  <div className="tvg-league-head">
                    <Link href={leaguePath(lang, lg.slug)} className="tvg-league-name">
                      <TeamLogo name={lg.name} logo={lg.logoUrl} size={20} />
                      <span>{lg.name}</span>
                      {lg.country ? (
                        <span className="tvg-league-country">{lg.country}</span>
                      ) : null}
                    </Link>
                    {lg.channels.length > 0 ? (
                      <div
                        className="tvg-chans"
                        aria-label={channelLabel}
                      >
                        {lg.channels.map((ch) => (
                          <span key={ch} className="tvg-chan">
                            {ch}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <ul className="tvg-matches">
                    {lg.matches.map((m) => {
                      const time = m.kickoff
                        ? formatKickoffShort(m.kickoff, lang)
                        : "";
                      const finishedOrLive =
                        m.homeScore != null && m.awayScore != null;
                      return (
                        <li key={m.slug} className="tvg-match">
                          <Link href={matchPath(lang, m.slug)} className="tvg-match-link">
                            <span className="tvg-time">{time}</span>
                            <span className="tvg-teams">
                              <span className="tvg-team">
                                <span className="tvg-tn">{m.homeName}</span>
                                <TeamLogo name={m.homeName} logo={m.homeLogo} size={18} />
                              </span>
                              {finishedOrLive ? (
                                <span className="tvg-score">
                                  {m.homeScore} - {m.awayScore}
                                </span>
                              ) : (
                                <span className="tvg-vs">-</span>
                              )}
                              <span className="tvg-team away">
                                <TeamLogo name={m.awayName} logo={m.awayLogo} size={18} />
                                <span className="tvg-tn">{m.awayName}</span>
                              </span>
                            </span>
                            {lg.channels.length > 0 ? (
                              <span className="tvg-match-chan">{lg.channels[0]}</span>
                            ) : (
                              <span className="tvg-match-chan empty" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </main>
        <aside className="rail-right" />
      </div>
    </>
  );
}
