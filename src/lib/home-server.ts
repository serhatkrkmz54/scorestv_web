import "server-only";
import { backendJson } from "./backend";
import { mapBasketballDay, mapVolleyballDay } from "./sport-day";
import type {
  FixtureDatesResponse,
  FixtureDayResponse,
} from "./fixtures-types";
import type {
  RawBasketballGame,
  RawVolleyballGame,
  SportDayResponse,
} from "./sport-scores-types";

export interface HomeServerData {
  dates: FixtureDatesResponse | null;
  day: FixtureDayResponse | null;
  date: string | null;
}

export interface SportHomeServerData {
  dates: FixtureDatesResponse | null;
  day: SportDayResponse | null;
  date: string | null;
}

/**
 * Anasayfa fikstürlerini SSR'da bir kez çeker — böylece Google'ın ilk aldığı
 * HTML'de canlı maçlar/skorlar yer alır (aksi halde ana kolonda yalnızca
 * "Yükleniyor…" görünürdü). Client tarafı bu tohumu hidre eder ve canlı
 * WebSocket/poll ile güncellemeye devam eder.
 *
 * <p>Hata / backend kapalı → alanlar null döner; sayfa çökmez, client-side
 * yükleme (mevcut davranış) devreye girer.
 */
export async function fetchHomeServer(
  lang: "tr" | "en",
): Promise<HomeServerData> {
  // 1) Tarih şeridi (bugün ± gün) — "today" buradan gelir.
  const dr = await backendJson<FixtureDatesResponse>(
    `/api/v1/fixtures/dates?days=5&lang=${lang}`,
  );
  const dates = dr.ok && dr.body ? dr.body : null;
  const date = dates?.today ?? null;

  // 2) Bugünün maç listesi (tüm durumlar) — canlı skorlar dahil.
  let day: FixtureDayResponse | null = null;
  if (date) {
    const fr = await backendJson<FixtureDayResponse>(
      `/api/v1/fixtures?date=${encodeURIComponent(date)}&status=all&lang=${lang}`,
    );
    day = fr.ok && fr.body ? fr.body : null;
  }

  return { dates, day, date };
}

/**
 * Basketbol/voleybol bölüm ana sayfası fikstürlerini SSR'da çeker — futbol
 * anasayfasıyla aynı SEO amacı (ilk HTML'de maçlar/skorlar). Tarih şeridi
 * futbol feed'inden (ortak takvim); günün maçları ilgili spor backend'inden
 * çekilip ortak SportDay modeline dönüştürülür. Hata → null (client yüklenir).
 */
export async function fetchSportHomeServer(
  sport: "basketball" | "volleyball",
  lang: "tr" | "en",
): Promise<SportHomeServerData> {
  const dr = await backendJson<FixtureDatesResponse>(
    `/api/v1/fixtures/dates?days=5&lang=${lang}`,
  );
  const dates = dr.ok && dr.body ? dr.body : null;
  const date = dates?.today ?? null;

  let day: SportDayResponse | null = null;
  if (date) {
    const path = `/api/v1/${sport}/games?date=${encodeURIComponent(date)}&lang=${lang}`;
    if (sport === "basketball") {
      const gr = await backendJson<RawBasketballGame[]>(path);
      if (gr.ok && Array.isArray(gr.body)) day = mapBasketballDay(gr.body, date);
    } else {
      const gr = await backendJson<RawVolleyballGame[]>(path);
      if (gr.ok && Array.isArray(gr.body)) day = mapVolleyballDay(gr.body, date);
    }
  }

  return { dates, day, date };
}
