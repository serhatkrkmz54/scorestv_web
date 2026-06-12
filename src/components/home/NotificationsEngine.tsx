"use client";

import { useCallback, useEffect, useRef } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import { useFavorites } from "@/context/favorites-context";
import { useNotifPrefs, type NotifEvent, type NotifPrefs } from "@/context/notif-prefs-context";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { categorize } from "@/lib/fixtures";
import { playNotifSound } from "@/lib/notif-sound";
import type { FixtureScore, FixtureStatus } from "@/lib/fixtures-types";

interface LivePayload {
  id: number;
  status: FixtureStatus;
  score: FixtureScore;
  homeTeam?: { name: string };
  awayTeam?: { name: string };
}

interface EventPayload {
  type: string | null;
  detail: string | null;
  playerName: string | null;
}

/**
 * Favori maçlar için canlı bildirim motoru. Kendi STOMP bağlantısı ile:
 *  - global /topic/fixtures/live/{lang} → maç başladı / bitti
 *  - favori maçların /topic/fixtures/{id}/events/{lang} → gol / kırmızı / penaltı
 * Seçili tiplerde ses (Web Audio) + tarayıcı bildirimi (izin varsa) verir.
 */
export function NotificationsEngine() {
  const { favs } = useFavorites();
  const { prefs } = useNotifPrefs();
  const { lang } = useLang();

  const clientRef = useRef<Client | null>(null);
  const connectedRef = useRef(false);
  const eventSubs = useRef<Map<number, StompSubscription>>(new Map());
  const info = useRef<Map<number, { home: string; away: string; cat: string }>>(new Map());

  const prefsRef = useRef<NotifPrefs>(prefs);
  const favsRef = useRef<Set<number>>(favs);
  const langRef = useRef(lang);
  useEffect(() => {
    prefsRef.current = prefs;
    favsRef.current = favs;
    langRef.current = lang;
  }, [prefs, favs, lang]);

  const fire = useCallback((key: NotifEvent, body: string) => {
    const p = prefsRef.current;
    if (!p[key]) return;
    const t = HOME_STR[langRef.current];
    const labels: Record<NotifEvent, string> = {
      goal: t.evGoal,
      redCard: t.evRedCard,
      penalty: t.evPenalty,
      start: t.evStart,
      end: t.evEnd,
    };
    const title = labels[key];
    if (p.sound) playNotifSound(key);
    if (p.push && typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(title, { body, tag: `${key}-${body}`, icon: "/logo-dark.png" });
      } catch {
        // bildirim gösterilemedi
      }
    }
  }, []);

  const label = useCallback((id: number) => {
    const i = info.current.get(id);
    return i ? `${i.home} - ${i.away}` : "";
  }, []);

  const onLive = useCallback(
    (raw: string) => {
      let u: LivePayload;
      try {
        u = JSON.parse(raw) as LivePayload;
      } catch {
        return;
      }
      const cat = categorize(u.status);
      const prev = info.current.get(u.id);
      const home = u.homeTeam?.name ?? prev?.home ?? "";
      const away = u.awayTeam?.name ?? prev?.away ?? "";
      info.current.set(u.id, { home, away, cat });
      if (!favsRef.current.has(u.id) || !prev) return;
      if (prev.cat === "upcoming" && cat === "live") fire("start", `${home} - ${away}`);
      else if (prev.cat === "live" && cat === "finished")
        fire("end", `${home} ${u.score.home ?? 0}-${u.score.away ?? 0} ${away}`);
    },
    [fire],
  );

  const onEvent = useCallback(
    (id: number, raw: string) => {
      let ev: EventPayload;
      try {
        ev = JSON.parse(raw) as EventPayload;
      } catch {
        return;
      }
      const type = ev.type ?? "";
      const detail = (ev.detail ?? "").toLowerCase();
      const who = ev.playerName ? ` · ${ev.playerName}` : "";
      const body = label(id) + who;
      if (type === "Card" && (detail.includes("red") || detail.includes("second yellow"))) {
        fire("redCard", body);
      } else if (detail.includes("penalty")) {
        fire("penalty", body);
      } else if (type === "Goal") {
        fire("goal", body);
      }
    },
    [fire, label],
  );

  const subscribeEvent = useCallback(
    (client: Client, id: number) => {
      if (eventSubs.current.has(id)) return;
      const sub = client.subscribe(`/topic/fixtures/${id}/events/${langRef.current}`, (msg) =>
        onEvent(id, msg.body),
      );
      eventSubs.current.set(id, sub);
    },
    [onEvent],
  );

  // Bağlantı (lang değişince yeniden kurulur — topic dili değişir)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;
    const client = new Client({
      brokerURL: url,
      reconnectDelay: 4000,
      heartbeatIncoming: 25000,
      heartbeatOutgoing: 25000,
      onConnect: () => {
        connectedRef.current = true;
        client.subscribe(`/topic/fixtures/live/${lang}`, (msg) => onLive(msg.body));
        favsRef.current.forEach((id) => subscribeEvent(client, id));
      },
      onWebSocketClose: () => {
        connectedRef.current = false;
        eventSubs.current.clear();
      },
    });
    clientRef.current = client;
    client.activate();
    const subs = eventSubs.current;
    return () => {
      void client.deactivate();
      clientRef.current = null;
      connectedRef.current = false;
      subs.clear();
    };
  }, [lang, onLive, subscribeEvent]);

  // Favoriler değişince event aboneliklerini eşitle
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !connectedRef.current) return;
    favs.forEach((id) => subscribeEvent(client, id));
    eventSubs.current.forEach((sub, id) => {
      if (!favs.has(id)) {
        try {
          sub.unsubscribe();
        } catch {
          // yut
        }
        eventSubs.current.delete(id);
      }
    });
  }, [favs, subscribeEvent]);

  return null;
}
