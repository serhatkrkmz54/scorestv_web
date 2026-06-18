/** Backend BroadcastView TS karşılığı — bir maçı yayınlayan TV kanalı. */
export interface Broadcast {
  channel: string;
  country?: string | null;
  logoUrl?: string | null;
}
