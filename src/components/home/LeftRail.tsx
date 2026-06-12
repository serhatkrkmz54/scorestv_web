"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { leaguePath, teamPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconFlame, IconGlobe } from "@/components/icons";
import type { PopularLeague, PopularTeam } from "@/lib/fixtures-types";

export function LeftRail() {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [leagues, setLeagues] = useState<PopularLeague[]>([]);
  const [teams, setTeams] = useState<PopularTeam[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [lr, tr] = await Promise.all([
          fetch(`/api/leagues/popular?lang=${lang}`, { cache: "no-store" }),
          fetch(`/api/teams/popular?lang=${lang}`, { cache: "no-store" }),
        ]);
        if (active && lr.ok) setLeagues((await lr.json()) as PopularLeague[]);
        if (active && tr.ok) setTeams((await tr.json()) as PopularTeam[]);
      } catch {
        // yut
      }
    })();
    return () => {
      active = false;
    };
  }, [lang]);

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
