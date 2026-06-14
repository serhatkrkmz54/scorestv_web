"use client";

import Link from "next/link";
import { playerPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import { IconLineup } from "@/components/icons";
import type {
  TeamDetailResponse,
  TeamSquadPlayer,
  TeamSquadGroup,
} from "@/lib/team-detail-types";

interface Props {
  detail: TeamDetailResponse;
  lang: "tr" | "en";
}

function PlayerPhoto({ player }: { player: TeamSquadPlayer }) {
  const photo = player.photo
    ?? (player.playerId
      ? `https://media.api-sports.io/football/players/${player.playerId}.png`
      : null);
  const initials = (player.name ?? "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => (s ? s[0].toUpperCase() : ""))
    .join("");
  return (
    <div className="team-squad-photo">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={player.name} loading="lazy" />
      ) : (
        <span className="team-squad-initials">{initials}</span>
      )}
    </div>
  );
}

function PlayerRow({
  player,
  lang,
}: {
  player: TeamSquadPlayer;
  lang: "tr" | "en";
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const slug = player.playerId
    ? buildEntitySlug(player.name ?? "", player.playerId)
    : null;
  const inner = (
    <>
      <PlayerPhoto player={player} />
      {player.number != null ? (
        <span className="team-squad-num tnum">{player.number}</span>
      ) : (
        <span className="team-squad-num team-squad-num-empty">—</span>
      )}
      <span className="team-squad-name">{player.name}</span>
      {player.age != null ? (
        <span className="team-squad-age tnum">
          {player.age} {t("yas", "y/o")}
        </span>
      ) : null}
    </>
  );
  if (slug) {
    return (
      <Link href={playerPath(lang, slug)} className="team-squad-row">
        {inner}
      </Link>
    );
  }
  return <div className="team-squad-row">{inner}</div>;
}

function SquadGroup({
  group,
  lang,
}: {
  group: TeamSquadGroup;
  lang: "tr" | "en";
}) {
  const label = (group.positionText && group.positionText.trim().length > 0)
    ? group.positionText
    : group.position;
  return (
    <section className="match-card team-squad-group">
      <header className="match-card-head">
        <h3>
          <IconLineup s={14} /> {label?.toUpperCase()}
          <span className="team-squad-count tnum">{group.players.length}</span>
        </h3>
      </header>
      <div className="team-squad-list">
        {group.players.map((p, i) => (
          <PlayerRow key={`${p.playerId ?? "_"}-${i}`} player={p} lang={lang} />
        ))}
      </div>
    </section>
  );
}

export function TeamSquadTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  if (!detail.squad || detail.squad.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Kadro bilgisi yok", "No squad data")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab team-tab-squad">
      {detail.squad.map((g, i) => (
        <SquadGroup key={`${g.position}-${i}`} group={g} lang={lang} />
      ))}
    </div>
  );
}
