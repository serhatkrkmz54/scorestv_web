"use client";

import { Client, type IMessage } from "@stomp/stompjs";
import type { FixtureScore, FixtureStatus } from "./fixtures-types";

// Backend /topic/fixtures/live/{lang} yayini -> LiveFixture. Sadece canli
// degisen alanlari (durum + skor) kullaniyoruz.
export interface LiveUpdate {
  id: number;
  status: FixtureStatus;
  score: FixtureScore;
  lastSyncedAt: string | null;
}

// STOMP istemcisi kurar; /ws/fixtures'a baglanip canli topic'e abone olur.
export function createLiveClient(
  url: string,
  lang: string,
  onUpdate: (u: LiveUpdate) => void,
): Client {
  const client = new Client({
    brokerURL: url,
    reconnectDelay: 4000,
    heartbeatIncoming: 25000,
    heartbeatOutgoing: 25000,
    onConnect: () => {
      client.subscribe(`/topic/fixtures/live/${lang}`, (msg: IMessage) => {
        try {
          onUpdate(JSON.parse(msg.body) as LiveUpdate);
        } catch {
          // bozuk mesaji yut
        }
      });
    },
  });
  return client;
}

// Backend EventBroadcaster payload'i (lokalize TR/EN). MatchEvent ile ayni sema.
export interface LiveEventUpdate {
  id?: number | null;
  timeElapsed?: number | null;
  timeExtra?: number | null;
  type: string;
  detail?: string | null;
  label?: string | null;
  team: { id: number; name: string; logo?: string | null };
  player?: { id?: number | null; name?: string | null } | null;
  assist?: { id?: number | null; name?: string | null } | null;
}

// Mac detay sayfasi icin STOMP istemcisi. Uc topic'e birden abone olur:
//   /topic/fixtures/{id}/{lang}         -> skor + durum (LiveUpdate)
//   /topic/fixtures/{id}/events/{lang}  -> yeni event (LiveEventUpdate)
//   /topic/fixtures/{id}/lineups        -> dizilis hazir sinyali (refetch)
export function createMatchDetailClient(
  url: string,
  fixtureId: number,
  lang: "tr" | "en",
  handlers: {
    onScore?: (u: LiveUpdate) => void;
    onEvent?: (e: LiveEventUpdate) => void;
    onLineupReady?: () => void;
  },
): Client {
  const client = new Client({
    brokerURL: url,
    reconnectDelay: 4000,
    heartbeatIncoming: 25000,
    heartbeatOutgoing: 25000,
    onConnect: () => {
      client.subscribe(
        `/topic/fixtures/${fixtureId}/${lang}`,
        (msg: IMessage) => {
          if (!handlers.onScore) return;
          try {
            handlers.onScore(JSON.parse(msg.body) as LiveUpdate);
          } catch {
            // bozuk mesaj
          }
        },
      );
      client.subscribe(
        `/topic/fixtures/${fixtureId}/events/${lang}`,
        (msg: IMessage) => {
          if (!handlers.onEvent) return;
          try {
            handlers.onEvent(JSON.parse(msg.body) as LiveEventUpdate);
          } catch {
            // bozuk mesaj
          }
        },
      );
      client.subscribe(`/topic/fixtures/${fixtureId}/lineups`, () => {
        handlers.onLineupReady?.();
      });
    },
  });
  return client;
}
