"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

export default function NewsPage() {
  const { lang } = useLang();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return (
    <div className="page-narrow">
      <div className="page-card">
        <h1>{t("Haberler", "News")}</h1>
        <p className="sub">{t("Haberler sayfası yakında hazır olacak.", "News page coming soon.")}</p>
        <Link href="/">
          <button className="login-btn">{t("Ana sayfaya dön", "Back to home")}</button>
        </Link>
      </div>
    </div>
  );
}
