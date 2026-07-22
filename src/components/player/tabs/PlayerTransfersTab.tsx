"use client";

import Link from "next/link";
import { teamPath } from "@/lib/routes";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconSwap, IconArrowUpRight } from "@/components/icons";
import type {
  PlayerDetailResponse,
  PlayerTransferRow,
  PlayerTeamRef,
} from "@/lib/player-detail-types";

interface Props {
  detail: PlayerDetailResponse;
  lang: "tr" | "en";
}

function formatDate(d: string | null | undefined, lang: "tr" | "en"): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      timeZone: "Europe/Istanbul",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(d));
  } catch {
    return d;
  }
}

function TeamCell({ team, lang }: { team: PlayerTeamRef | null | undefined; lang: "tr" | "en" }) {
  if (!team) return <span className="player-transfer-team">—</span>;
  const inner = (
    <>
      <TeamLogo name={team.name} logo={team.logo ?? null} size={18} />
      <span>{team.name}</span>
    </>
  );
  if (team.slug) {
    return (
      <Link href={teamPath(lang, team.slug)} className="player-transfer-team">
        {inner}
      </Link>
    );
  }
  return <span className="player-transfer-team">{inner}</span>;
}

function TransferRow({ row, lang }: { row: PlayerTransferRow; lang: "tr" | "en" }) {
  return (
    <div className="player-transfer-row">
      <TeamCell team={row.fromTeam} lang={lang} />
      <span className="player-transfer-arrow">
        <IconArrowUpRight s={14} />
      </span>
      <TeamCell team={row.toTeam} lang={lang} />
      <span className="player-transfer-date tnum">
        {formatDate(row.date, lang)}
      </span>
      {row.typeText ?? row.type ? (
        <span className="player-transfer-type">{row.typeText ?? row.type}</span>
      ) : null}
    </div>
  );
}

export function PlayerTransfersTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const transfers = detail.transfers ?? [];
  if (transfers.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Transfer kaydı yok", "No transfers")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab player-tab-transfers">
      <section className="match-card">
        <header className="match-card-head">
          <h2>
            <IconSwap s={14} /> {t("Transfer Kariyeri", "Transfer Career")}
            <span className="team-squad-count tnum">{transfers.length}</span>
          </h2>
        </header>
        <div className="player-transfer-list">
          {transfers.map((r, i) => (
            <TransferRow key={i} row={r} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  );
}
