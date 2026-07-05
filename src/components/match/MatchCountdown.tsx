"use client";

import { useEffect, useState, type ReactNode } from "react";

// Kalan sure (ms); gecmisse 0.
function remainingMs(target: number): number {
  const ms = target - Date.now();
  return ms > 0 ? ms : 0;
}

/**
 * Maç hero'sunda ortadaki "vs" yerine, başlama saatine geri sayan sayaç.
 * Gün varsa "2g 05:23:11", yoksa "05:23:11".
 *
 * - Hydration güvenli: sunucu ve ilk client render'da {@code fallback}
 *   gösterilir (saat farkı kaynaklı uyumsuzluk olmaz); sayaç mount sonrası
 *   canlanır.
 * - Geçersiz tarih veya süre bittiğinde de {@code fallback} (vs) gösterilir —
 *   maç WebSocket/refresh ile canlıya döndüğünde skor devralır.
 */
export function MatchCountdown({
  kickoff,
  lang,
  fallback = null,
}: {
  kickoff: string;
  lang: "tr" | "en";
  fallback?: ReactNode;
}) {
  const target = new Date(kickoff).getTime();
  const valid = !Number.isNaN(target);
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    if (!valid) return;
    const tick = () => setMs(remainingMs(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, valid]);

  if (!valid || ms === null || ms <= 0) {
    return <>{fallback}</>;
  }

  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const dayUnit = lang === "tr" ? "G" : "D";
  const label = lang === "tr" ? "Başlamasına" : "Starts in";
  // Gün varsa saatin ONUNE aynı boyut/renkte inline yazılır: "1G:03:31:25".
  const clock = `${d > 0 ? `${d}${dayUnit}:` : ""}${pad(h)}:${pad(m)}:${pad(s)}`;

  return (
    <div className="match-hero-countdown" role="timer" aria-label={`${label} ${clock}`}>
      <span className="mhcd-clock tnum">{clock}</span>
      <span className="mhcd-label">{label}</span>
    </div>
  );
}
