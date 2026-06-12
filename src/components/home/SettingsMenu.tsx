"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { useNotifPrefs, type NotifPrefs } from "@/context/notif-prefs-context";
import { IconBell, IconSettings, IconVolume } from "@/components/icons";

export function SettingsMenu() {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const { prefs, setPref, enablePush } = useNotifPrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const events: { key: keyof NotifPrefs; label: string }[] = [
    { key: "goal", label: t.evGoal },
    { key: "redCard", label: t.evRedCard },
    { key: "penalty", label: t.evPenalty },
    { key: "start", label: t.evStart },
    { key: "end", label: t.evEnd },
  ];

  return (
    <div className="settings-menu" ref={ref}>
      <button
        className="settings-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.notifSettings}
      >
        <IconSettings s={18} />
      </button>
      {open && (
        <div className="settings-drop">
          <div className="sd-title">{t.notifSettings}</div>
          {events.map((ev) => (
            <label className="sd-row" key={ev.key}>
              <span>{ev.label}</span>
              <input
                type="checkbox"
                checked={prefs[ev.key]}
                onChange={(e) => setPref(ev.key, e.target.checked)}
              />
            </label>
          ))}
          <div className="sd-sep" />
          <label className="sd-row">
            <span className="sd-label"><IconVolume s={16} /> {t.sound}</span>
            <input
              type="checkbox"
              checked={prefs.sound}
              onChange={(e) => setPref("sound", e.target.checked)}
            />
          </label>
          <label className="sd-row">
            <span className="sd-label"><IconBell s={16} /> {t.webPush}</span>
            <input
              type="checkbox"
              checked={prefs.push}
              onChange={async (e) => {
                if (e.target.checked) await enablePush();
                else setPref("push", false);
              }}
            />
          </label>
          {!prefs.push && <div className="sd-hint">{t.pushHint}</div>}
        </div>
      )}
    </div>
  );
}
