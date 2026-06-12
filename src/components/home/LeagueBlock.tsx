"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { categorize } from "@/lib/fixtures";
import type { LeagueGroup } from "@/lib/fixtures-types";
import { leaguePath } from "@/lib/routes";
import { CountryFlag } from "@/components/shell/CountryFlag";
import { useFavorites } from "@/context/favorites-context";
import { IconChevronRight, IconStar } from "@/components/icons";
import { MatchRow } from "./MatchRow";

export function LeagueBlock({ group }: { group: LeagueGroup }) {
  const router = useRouter();
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [open, setOpen] = useState(true);

  const { league, fixtures } = group;
  const liveN = fixtures.filter((f) => categorize(f.status) === "live").length;
  const { addMany, removeMany, hasAll } = useFavorites();
  const ids = fixtures.map((f) => f.id);
  const allFav = hasAll(ids);
  const round = fixtures[0]?.round ?? null;

  // Lig slug'ı: önce grup başlığındaki slug, yoksa maçın leagueRef slug'ı, o da yoksa id.
  const leagueKey = league.slug ?? fixtures[0]?.leagueRef.slug ?? String(league.id);
  const goLeague = () => router.push(leaguePath(lang, leagueKey));

  return (
    <div className="league-block">
      <div className="league-head">
        <CountryFlag flag={league.countryFlag} country={league.country} size={24} />
        <div className="lh-id">
          <span className="lh-name" onClick={goLeague}>
            {league.name}
          </span>
          <span className="lh-sub">
            {league.country}
            {round ? ` · ${round}` : ""}
          </span>
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
      {open && fixtures.map((f) => <MatchRow key={f.id} fixture={f} />)}
    </div>
  );
}
