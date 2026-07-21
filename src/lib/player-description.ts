// Oyuncu için gerçek verilere dayalı KISA + ÖZGÜN açıklama paragrafı üretir.
// SEO: sayfada okunabilir metin olmayınca Google "thin content" sayıyor;
// burada takım, mevki, doğum tarihi ve o sezonki performanstan otomatik,
// oyuncuya özel (kopya olmayan) bir paragraf kuruyoruz. Her cümle YALNIZ
// verisi varsa eklenir; yeterli veri yoksa null döner (paragraf gösterilmez).
// Ekstra API çağrısı YOK — hepsi mevcut PlayerDetailResponse'tan.

import { ageFromBirth, type PlayerDetailResponse } from "./player-detail-types";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function path(obj: unknown, keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

/** "2024" → "2024-25" (Eylül–Mayıs sezon konvansiyonu). */
function seasonLabel(year: number): string {
  const next = (year + 1) % 100;
  return `${year}-${String(next).padStart(2, "0")}`;
}

function formatBirthDate(iso: string, lang: "tr" | "en"): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** İngilizce a/an — sayı telaffuzu (18/8/80'ler → "an") ve sesli harf. */
function enArticle(s: string): "a" | "an" {
  const t = s.trim().toLowerCase();
  if (/^\d/.test(t)) {
    return /^(8|11|18|8\d)\b/.test(t) ? "an" : "a";
  }
  return /^[aeiou]/.test(t) ? "an" : "a";
}

/** Liste öğelerini "a, b ve c" / "a, b and c" biçiminde birleştirir. */
function joinList(items: string[], lang: "tr" | "en"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  const and = lang === "tr" ? "ve" : "and";
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

/**
 * @returns oyuncuya özel açıklama paragrafı; anlamlı veri yoksa null.
 */
export function playerDescription(
  detail: PlayerDetailResponse,
  lang: "tr" | "en",
): string | null {
  const tr = lang === "tr";
  const name = (detail.name || "").trim();
  if (!name) return null;

  const position = (detail.positionText || detail.position || "").trim();
  const posLower = position
    ? position.toLocaleLowerCase(tr ? "tr-TR" : "en-US")
    : "";
  const team = (detail.currentTeam?.name || "").trim();
  const age = ageFromBirth(detail.birth?.date ?? null, detail.age ?? null);
  const birthIso = detail.birth?.date ?? null;
  const birthDate = birthIso ? formatBirthDate(birthIso, lang) : null;

  // Seçili sezon toplamları (birden fazla takım/lig satırı olabilir → topla).
  let apps = 0;
  let goals = 0;
  let assists = 0;
  for (const st of detail.seasonStats ?? []) {
    const s = st.stats ?? {};
    apps += num(path(s, ["games", "appearences"]));
    goals += num(path(s, ["goals", "total"]));
    assists += num(path(s, ["goals", "assists"]));
  }
  const season = detail.selectedSeason ?? null;
  const hasSeasonPerf = season != null && apps > 0;

  // Anlamlı veri yoksa (sadece isim) paragraf üretme.
  if (!team && age == null && !posLower && !hasSeasonPerf) return null;

  const sentences: string[] = [];

  // 1) Kimlik cümlesi
  if (tr) {
    const mid: string[] = [];
    if (team) mid.push(`${team} forması giyen`);
    if (age != null) mid.push(`${age} yaşındaki`);
    const descriptor = posLower || "futbolcu";
    const midStr = mid.join(" ");
    sentences.push(midStr ? `${name}, ${midStr} ${descriptor}.` : `${name}, ${descriptor}.`);
  } else {
    const descriptor = [
      age != null ? `${age}-year-old` : null,
      posLower || "footballer",
    ]
      .filter(Boolean)
      .join(" ");
    const article = enArticle(descriptor);
    const teamStr = team ? ` playing for ${team}` : "";
    sentences.push(`${name} is ${article} ${descriptor}${teamStr}.`);
  }

  // 2) Doğum tarihi
  if (birthDate) {
    sentences.push(
      tr ? `${birthDate} doğumludur.` : `Born on ${birthDate}.`,
    );
  }

  // 3) Sezon performansı (yalnız veri varsa)
  if (hasSeasonPerf) {
    const label = seasonLabel(season as number);
    if (tr) {
      const extras: string[] = [];
      if (goals > 0) extras.push(`${goals} gol`);
      if (assists > 0) extras.push(`${assists} asist`);
      if (extras.length > 0) {
        sentences.push(
          `${label} sezonunda ${apps} maça çıkarak ${joinList(extras, "tr")} kaydetti.`,
        );
      } else {
        sentences.push(`${label} sezonunda ${apps} maça çıktı.`);
      }
    } else {
      const bits: string[] = [`${apps} appearances`];
      if (goals > 0) bits.push(`${goals} goals`);
      if (assists > 0) bits.push(`${assists} assists`);
      sentences.push(
        `The ${label} season brought ${joinList(bits, "en")}.`,
      );
    }
  }

  return sentences.join(" ");
}
