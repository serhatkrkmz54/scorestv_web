"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { basketballLeaguePath, basketballTeamPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconFlame, IconStar } from "@/components/icons";
import { useSilentRetry } from "@/lib/silent-retry";
import type { PopularLeague, PopularTeam } from "@/lib/fixtures-types";

/**
 * Basketbol sol rayi — futbol {@link LeftRail} esi. Populer ligler/takimlar
 * artik BACKEND config'inden gelir (scorestv.basketball.serving.*), frontend
 * sabitinden DEGIL. BFF: /api/basketball/leagues/popular + .../teams/popular.
 * Liste backend'de bossa ilgili bolum hic gorunmez. Slug'lar backend'de
 * uretildigi icin {@link basketballLeaguePath}/{@link basketballTeamPath}'e
 * dogrudan verilir.
 *
 * <p>Backend cold-start'ta dusuk olabilir; futbol gibi {@link useSilentRetry}
 * ile her iki listeyi de bagimsiz backoff'la cekiyoruz.
 */
export function BasketballLeftRail() {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [leagues, setLeagues] = useState<PopularLeague[]>([]);
  const [teams, setTeams] = useState<PopularTeam[]>([]);

  // Dil degisince state'leri sifirla — useSilentRetry `enabled: length === 0`
  // ile calistigindan, listeyi bosaltinca hook yeni dil parametresiyle yeniden
  // ceker ve TR/EN secimi sol ray'a anlik yansir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dil degisince listeyi tazele (kasitli)
    setLeagues([]);
    setTeams([]);
  }, [lang]);

  // Bagimsiz retry zincirleri — biri dolarsa digeri yine de retry'a devam eder.
  useSilentRetry<PopularLeague[]>({
    enabled: leagues.length === 0,
    isDone: () => leagues.length > 0,
    fetcher: async (signal) => {
      const r = await fetch(`/api/basketball/leagues/popular?lang=${lang}`, {
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
      const r = await fetch(`/api/basketball/teams/popular?lang=${lang}`, {
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
            <Link
              key={l.id}
              href={basketballLeaguePath(lang, l.slug)}
              className="rl-item"
            >
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
              <IconStar s={14} />
            </span>
            {lang === "tr" ? "Takımlar" : "Teams"}
          </div>
          {teams.map((tm) => (
            <Link
              key={tm.id}
              href={basketballTeamPath(lang, tm.slug)}
              className="rl-item"
            >
              <TeamLogo name={tm.name} logo={tm.logo} size={21} />
              <span className="nm">{tm.name}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
