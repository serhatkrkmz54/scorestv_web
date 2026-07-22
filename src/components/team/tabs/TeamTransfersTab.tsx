"use client";

import Link from "next/link";
import { teamPath, playerPath } from "@/lib/routes";
import { buildEntitySlug } from "@/lib/slug-utils";
import { TeamLogo } from "@/components/shell/TeamLogo";
import { IconSwap, IconArrowUpRight } from "@/components/icons";
import type {
  TeamDetailResponse,
  TeamTransferRow,
} from "@/lib/team-detail-types";

interface Props {
  detail: TeamDetailResponse;
  lang: "tr" | "en";
}

function formatTransferDate(d: string | null | undefined, lang: "tr" | "en"): string {
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

function TransferRow({
  t: row,
  lang,
}: {
  t: TeamTransferRow;
  lang: "tr" | "en";
}) {
  const tt = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const isIn = (row.direction ?? "in").toLowerCase() === "in";
  const dirClass = isIn ? "is-in" : "is-out";
  const dirLabel = isIn ? tt("Geldi", "In") : tt("Gitti", "Out");

  const playerSlug = row.playerId
    ? buildEntitySlug(row.playerName ?? "", row.playerId)
    : null;
  const playerHref = playerSlug ? playerPath(lang, playerSlug) : null;
  const cpHref = row.counterpartyTeamSlug
    ? teamPath(lang, row.counterpartyTeamSlug)
    : null;

  return (
    <div className={`team-transfer-row ${dirClass}`}>
      <span className={`team-transfer-dir ${dirClass}`} title={dirLabel}>
        <IconArrowUpRight s={14} />
      </span>
      <div className="team-transfer-body">
        {playerHref ? (
          <Link href={playerHref} className="team-transfer-player">
            {row.playerName ?? "—"}
          </Link>
        ) : (
          <span className="team-transfer-player">{row.playerName ?? "—"}</span>
        )}
        <div className="team-transfer-meta">
          {row.counterpartyTeamName ? (
            <span className="team-transfer-cp">
              {row.counterpartyTeamLogo ? (
                <TeamLogo
                  name={row.counterpartyTeamName}
                  logo={row.counterpartyTeamLogo}
                  size={14}
                />
              ) : null}
              {cpHref ? (
                <Link href={cpHref} className="team-transfer-cp-link">
                  {row.counterpartyTeamName}
                </Link>
              ) : (
                <span>{row.counterpartyTeamName}</span>
              )}
            </span>
          ) : null}
          {row.date ? (
            <span className="team-transfer-date tnum">
              {formatTransferDate(row.date, lang)}
            </span>
          ) : null}
        </div>
      </div>
      {row.typeText ?? row.type ? (
        <span className="team-transfer-type">{row.typeText ?? row.type}</span>
      ) : null}
    </div>
  );
}

export function TeamTransfersTab({ detail, lang }: Props) {
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
    <div className="match-tab team-tab-transfers">
      <section className="match-card">
        <header className="match-card-head">
          <h2>
            <IconSwap s={14} /> {t("Transferler", "Transfers")}
            <span className="team-squad-count tnum">{transfers.length}</span>
          </h2>
        </header>
        <div className="team-transfer-list">
          {transfers.map((r, i) => (
            <TransferRow key={`${r.playerId ?? "_"}-${i}`} t={r} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  );
}
