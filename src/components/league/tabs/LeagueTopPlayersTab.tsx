"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { teamPath, playerPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import type {
  LeagueDetailResponse,
  LeagueTopPlayerView,
} from "@/lib/league-detail-types";

interface Props {
  detail: LeagueDetailResponse;
  lang: "tr" | "en";
}

type Kind = "scorers" | "assists" | "yellow" | "red";

function PlayerPhoto({ p, size = 32 }: { p: LeagueTopPlayerView; size?: number }) {
  const photo = p.playerId
    ? `https://media.api-sports.io/football/players/${p.playerId}.png`
    : p.playerPhoto ?? null;
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={p.playerName ?? ""}
        className="topplayer-photo"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }
  const initials = (p.playerName ?? "?").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("");
  return (
    <span
      className="topplayer-initials"
      style={{ width: size, height: size }}
    >{initials}</span>
  );
}

function PlayerRow({ p, kind, lang }: { p: LeagueTopPlayerView; kind: Kind; lang: "tr" | "en" }) {
  const name = p.playerName ?? "—";
  const playerSlug = p.playerId ? buildEntitySlug(name, p.playerId) : null;
  return (
    <li className="topplayer-row">
      <span className="topplayer-rank tnum">{p.rank ?? "—"}</span>
      <PlayerPhoto p={p} />
      <span className="topplayer-name-wrap">
        {playerSlug ? (
          <Link href={playerPath(lang, playerSlug)} className="topplayer-name">{name}</Link>
        ) : (
          <span className="topplayer-name">{name}</span>
        )}
        <span className="topplayer-team">
          {p.teamLogo ? (
            <TeamLogo name={p.teamName ?? ""} logo={p.teamLogo} size={14} />
          ) : null}
          {p.teamSlug && p.teamName ? (
            <Link href={teamPath(lang, p.teamSlug)}>{p.teamName}</Link>
          ) : (
            <span>{p.teamName ?? ""}</span>
          )}
        </span>
      </span>
      <span className="topplayer-value tnum">
        {p.value ?? 0}
        {kind === "yellow" && p.valueSecondary != null && p.valueSecondary > 0 ? (
          <small className="topplayer-value-sec"> +{p.valueSecondary}</small>
        ) : null}
      </span>
    </li>
  );
}

export function LeagueTopPlayersTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [kind, setKind] = useState<Kind>("scorers");

  const segs: { key: Kind; label: string; rows: LeagueTopPlayerView[] }[] = [
    { key: "scorers", label: t("Gol", "Goals"), rows: detail.topScorers ?? [] },
    { key: "assists", label: t("Asist", "Assists"), rows: detail.topAssists ?? [] },
    { key: "yellow", label: t("Sarı Kart", "Yellow"), rows: detail.topYellowCards ?? [] },
    { key: "red", label: t("Kırmızı Kart", "Red"), rows: detail.topRedCards ?? [] },
  ];

  const active = segs.find((s) => s.key === kind) ?? segs[0];

  return (
    <div className="match-tab">
      <div className="standings-group-tabs-wrap">
        <div className="standings-group-tabs">
          {segs.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setKind(s.key)}
              className={`standings-group-tab ${kind === s.key ? "is-active" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <section className="match-card">
        {active.rows.length === 0 ? (
          <p className="match-empty">
            {t("Veri yok", "No data")}
          </p>
        ) : (
          <ul className="topplayer-list">
            {active.rows.map((p, i) => (
              <PlayerRow key={(p.playerId ?? i) + "-" + i} p={p} kind={active.key} lang={lang} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
