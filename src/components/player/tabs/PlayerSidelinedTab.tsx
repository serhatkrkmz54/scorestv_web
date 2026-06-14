"use client";

import { IconMed } from "@/components/icons";
import type {
  PlayerDetailResponse,
  PlayerSidelinedRow,
} from "@/lib/player-detail-types";

interface Props {
  detail: PlayerDetailResponse;
  lang: "tr" | "en";
}

function formatDate(d: string | null | undefined, lang: "tr" | "en"): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(d));
  } catch {
    return d;
  }
}

function SideRow({ row, lang }: { row: PlayerSidelinedRow; lang: "tr" | "en" }) {
  return (
    <div className="player-side-row">
      <span className="player-side-icon"><IconMed s={14} /></span>
      <span className="player-side-type">{row.typeText ?? row.type ?? "—"}</span>
      <span className="player-side-range tnum">
        {formatDate(row.start, lang)}
        {row.end ? ` → ${formatDate(row.end, lang)}` : ""}
      </span>
    </div>
  );
}

export function PlayerSidelinedTab({ detail, lang }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const list = detail.sidelined ?? [];
  if (list.length === 0) {
    return (
      <div className="match-tab">
        <section className="match-card">
          <p className="match-empty">{t("Sakatlik kaydi yok", "No injury records")}</p>
        </section>
      </div>
    );
  }
  return (
    <div className="match-tab player-tab-sidelined">
      <section className="match-card">
        <header className="match-card-head">
          <h3>
            <IconMed s={14} /> {t("Sakatlik / Cezalik Gecmisi", "Injury / Ban History")}
            <span className="team-squad-count tnum">{list.length}</span>
          </h3>
        </header>
        <div className="player-side-list">
          {list.map((r, i) => (
            <SideRow key={i} row={r} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  );
}
