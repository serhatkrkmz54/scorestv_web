"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { leaguePath, teamPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconFlame, IconGlobe } from "@/components/icons";
import { useSilentRetry } from "@/lib/silent-retry";
import type { PopularLeague, PopularTeam } from "@/lib/fixtures-types";

/**
 * Sol ray: Populer Ligler + Ulkeler (milli takimlar).
 *
 * Backend cold-start halinde olabilir veya deploy sirasinda kisa sureli
 * dusebilir. {@link useSilentRetry} ile her iki listeyi de bagimsiz olarak
 * 1/2/4/8/15s backoff'la cekiyoruz. Window focus / online event'lerinde
 * anlik retry tetiklenir; kullanici tab'a geri donunce / wifi gelince
 * veriler F5 atmadan gelir.
 */
export function LeftRail() {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [leagues, setLeagues] = useState<PopularLeague[]>([]);
  const [teams, setTeams] = useState<PopularTeam[]>([]);

  // Bagimsiz retry zincirleri — biri dolarsa digeri yine de retry'a devam eder.
  useSilentRetry<PopularLeague[]>({
    enabled: leagues.length === 0,
    isDone: () => leagues.length > 0,
    fetcher: async (signal) => {
      const r = await fetch(`/api/leagues/popular?lang=${lang}`, {
        cache: "no-store",
        signal,
      });
      if (!r.ok) return null;
      const data = (await r.json()) as PopularLeague[];
      return data.length > 0 ? data : null;
    },
    onSuccess: setLeagues,
  });

  useSilentRetry<PopularTeam[]>({
    enabled: teams.length === 0,
    isDone: () => teams.length > 0,
    fetcher: async (signal) => {
      const r = await fetch(`/api/teams/popular?lang=${lang}`, {
        cache: "no-store",
        signal,
      });
      if (!r.ok) return null;
      const data = (await r.json()) as PopularTeam[];
      return data.length > 0 ? data : null;
    },
    onSuccess: setTeams,
  });

  return (
    <>
      {leagues.length > 0 && (
        <div className="rl-section">
          <div className="rl-head">
            <span className="flame">
              <IconFlame s={14} />
            </span>
            {t.leagues}
          </div>
          {leagues.map((l) => (
            <Link key={l.id} href={leaguePath(lang, l.slug)} className="rl-item">
              <TeamLogo name={l.name} logo={l.logo} size={21} />
              <span className="nm">{l.name}</span>
            </Link>
          ))}
        </div>
      )}

      {teams.length > 0 && (
        <div className="rl-section">
          <div className="rl-head">
            <span className="flame">
              <IconGlobe s={15} />
            </span>
            {t.countries}
          </div>
          {teams.map((tm) => (
            <Link key={tm.id} href={teamPath(lang, tm.slug)} className="rl-item">
              <TeamLogo name={tm.name} logo={tm.logo} size={21} />
              <span className="nm">{tm.name}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
