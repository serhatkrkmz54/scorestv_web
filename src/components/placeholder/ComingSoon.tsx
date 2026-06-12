"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

export function ComingSoon({
  kind,
  value,
}: {
  kind: "match" | "league" | "team" | "country";
  value: string;
}) {
  const { lang } = useLang();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const titles = {
    match: t("Maç Detayı", "Match Detail"),
    league: t("Lig Sayfası", "League Page"),
    team: t("Takım Sayfası", "Team Page"),
    country: t("Ülke Sayfası", "Country Page"),
  };

  return (
    <div className="page-narrow">
      <div className="page-card">
        <h1>{titles[kind]}</h1>
        <p className="sub">
          {t("Bu sayfa yakında hazır olacak.", "This page is coming soon.")}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-faint)", wordBreak: "break-all", margin: "0 0 18px" }}>
          <code>{value}</code>
        </p>
        <Link href="/">
          <button className="login-btn">{t("Ana sayfaya dön", "Back to home")}</button>
        </Link>
      </div>
    </div>
  );
}
