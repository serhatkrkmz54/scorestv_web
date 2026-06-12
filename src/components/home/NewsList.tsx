"use client";

import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { colorFromName } from "@/lib/fixtures";
import { MOCK_NEWS } from "./right-rail-mock";

export function NewsList() {
  const { lang } = useLang();
  const t = HOME_STR[lang];

  return (
    <div className="rl-section">
      <div className="card-head">
        <h3>{t.news}</h3>
      </div>
      {MOCK_NEWS.map((n) => (
        <div className="nl-item" key={n.title}>
          <span className="nl-thumb" style={{ background: colorFromName(n.seed) }}>
            {n.category.charAt(0)}
          </span>
          <div className="nl-body">
            <div className="nl-title">{n.title}</div>
            <div className="nl-meta">
              {n.category} · {n.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
