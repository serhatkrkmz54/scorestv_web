"use client";

import { Client, type IMessage } from "@stomp/stompjs";
import type { FixtureScore, FixtureStatus } from "./fixtures-types";

// Backend /topic/fixtures/live/{lang} yayını → LiveFixture; sadece canlı değişen
// alanları (durum + skor) kullanıyoruz.
export interface LiveUpdate {
  id: number;
  status: FixtureStatus;
  score: FixtureScore;
  lastSyncedAt: string | null;
}

/** STOMP istemcisi kurar; /ws/fixtures'a bağlanıp canlı topic'e abone olur. */
export function createLiveClient(
  url: string,
  lang: string,
  onUpdate: (u: LiveUpdate) => void,
): Client {
  const client = new Client({
    brokerURL: url, // wss://api.scorestv.com/ws/fixtures
    reconnectDelay: 4000,
    heartbeatIncoming: 25000,
    heartbeatOutgoing: 25000,
    onConnect: () => {
      client.subscribe(`/topic/fixtures/live/${lang}`, (msg: IMessage) => {
        try {
          onUpdate(JSON.parse(msg.body) as LiveUpdate);
        } catch {
          // bozuk mesajı yut
        }
      });
    },
  });
  return client;
}
