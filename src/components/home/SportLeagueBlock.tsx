"use client";

import { useState } from "react";
import { useLang } from "@/context/lang-context";
import { categorizeSport } from "@/lib/sport-scores";
import type { SportLeagueGroup } from "@/lib/sport-scores-types";
import type { Sport } from "@/lib/sports";
import { CountryFlag } from "@/components/shell/CountryFlag";
import { useFavorites } from "@/context/favorites-context";
import { HOME_STR } from "@/i18n/home-strings";
import { IconChevronRight, IconStar } from "@/components/icons";
import { SportMatchRow } from "./SportMatchRow";

export function SportLeagueBlock({
  group,
  sport,
}: {
  group: SportLeagueGroup;
  sport: Sport;
}) {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [open, setOpen] = useState(true);

  const { league, games } = group;
  const liveN = games.filter((g) => categorizeSport(sport, g.status) === "live").length;
  const { addMany, removeMany, hasAll } = useFavorites();
  const ids = games.map((g) => g.id);
  const allFav = hasAll(ids);

  return (
    <div className="league-block">
      <div className="league-head">
        <CountryFlag flag={league.countryFlag} country={league.country} size={24} />
        <div className="lh-id">
          <span className="lh-name">{league.name}</span>
          <span className="lh-sub">{league.country}</span>
        </div>
        <div className="lh-actions">
          {liveN > 0 && (
            <span className="mr-live" style={{ fontSize: 13 }}>
              <span className="live-dot pulse" /> {liveN}
            </span>
          )}
          <button
            className={"lh-fav" + (allFav ? " on" : "")}
            onClick={(e) => {
              e.stopPropagation();
              if (allFav) removeMany(ids);
              else addMany(ids);
            }}
            aria-label={t.favLeague}
            title={t.favLeague}
          >
            <IconStar s={16} fill={allFav ? "currentColor" : "none"} />
          </button>
          <button
            className="lh-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Kapat" : "Aç"}
          >
            <span className={"chev" + (open ? " open" : "")}>
              <IconChevronRight s={16} />
            </span>
          </button>
        </div>
      </div>
      {open && games.map((g) => <SportMatchRow key={g.id} game={g} />)}
    </div>
  );
}
