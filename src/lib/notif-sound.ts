"use client";

let ctx: AudioContext | null = null;

/** Olay tipine göre kısa bir bildirim sesi çalar (asset gerektirmez). */
export function playNotifSound(kind: string): void {
  if (typeof window === "undefined") return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();

    const notes =
      kind === "goal"
        ? [880, 1175, 1568]
        : kind === "redCard"
          ? [392, 311]
          : kind === "penalty"
            ? [660, 990]
            : [587, 784]; // start / end / diğer
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const t0 = now + i * 0.13;
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t0);
      osc.stop(t0 + 0.22);
    });
  } catch {
    // ses çalınamadı, yut
  }
}
