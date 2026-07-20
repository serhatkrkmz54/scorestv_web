"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Kare profil resmi kırpma modalı — harici bağımlılık YOK (saf canvas).
 *
 * Kullanıcı yüksek boyutlu bir fotoğrafı yakınlaştırıp (zoom) kaydırarak
 * (pan) kare çerçeveye bozulmadan oturtur. "cover" mantığıyla çalışır: en
 * yakınlaştırma seviyesinde bile görüntü çerçeveyi tam kaplar (boşluk olmaz).
 * Onaylanınca seçili kare bölge {@code OUT}px'e çizilip JPEG blob döner.
 */
const OUT = 512; // çıktı kenar uzunluğu (px)

export function AvatarCropModal({
  file,
  lang,
  busy = false,
  onCancel,
  onConfirm,
}: {
  file: File;
  lang: "tr" | "en";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const viewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [view, setView] = useState(300); // kare görüntü kenarı (ölçülür)
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Kaplama (cover) taban ölçeği: kısa kenar çerçeveye tam otursun.
  const baseScale = nat ? view / Math.min(nat.w, nat.h) : 1;
  const eff = baseScale * zoom;
  const dispW = nat ? nat.w * eff : 0;
  const dispH = nat ? nat.h * eff : 0;

  // Offset'i çerçeve daima dolu kalacak şekilde sınırla.
  const clamp = useCallback(
    (x: number, y: number, w: number, h: number) => ({
      x: Math.min(0, Math.max(view - w, x)),
      y: Math.min(0, Math.max(view - h, y)),
    }),
    [view],
  );

  const onImgLoad = useCallback(() => {
    const el = imgRef.current;
    const box = viewRef.current;
    if (!el || !box) return;
    const v = box.clientWidth || 300;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    const bs = v / Math.min(w, h);
    const dw = w * bs;
    const dh = h * bs;
    setView(v);
    setNat({ w, h });
    setZoom(1);
    setOffset({ x: (v - dw) / 2, y: (v - dh) / 2 }); // ortala
  }, []);

  // Zoom değişince görüntü merkezini sabit tut.
  const applyZoom = useCallback(
    (nextZoom: number) => {
      if (!nat) return;
      const z = Math.min(4, Math.max(1, nextZoom));
      const effOld = baseScale * zoom;
      const effNew = baseScale * z;
      const cx = view / 2;
      const cy = view / 2;
      const imgX = (cx - offset.x) / effOld;
      const imgY = (cy - offset.y) / effOld;
      const nx = cx - imgX * effNew;
      const ny = cy - imgY * effNew;
      const dw = nat.w * effNew;
      const dh = nat.h * effNew;
      setZoom(z);
      setOffset(clamp(nx, ny, dw, dh));
    },
    [nat, baseScale, zoom, offset, view, clamp],
  );

  // ---- Sürükleme (pan) ----
  const drag = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !nat) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => clamp(o.x + dx, o.y + dy, dispW, dispH));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    applyZoom(zoom + (e.deltaY < 0 ? 0.12 : -0.12));
  };

  // Esc ile kapat
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel, busy]);

  const confirm = useCallback(() => {
    const el = imgRef.current;
    if (!el || !nat) return;
    const sSize = Math.min(nat.w, nat.h) / zoom; // kaynak kare (doğal px)
    const sx = (-offset.x) / eff;
    const sy = (-offset.y) / eff;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(el, sx, sy, sSize, sSize, 0, 0, OUT, OUT);
    canvas.toBlob(
      (blob) => {
        if (blob) void onConfirm(blob);
      },
      "image/jpeg",
      0.9,
    );
  }, [nat, zoom, offset, eff, onConfirm]);

  return (
    <div
      className="avatar-crop-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div className="avatar-crop-modal">
        <h3 className="avatar-crop-title">{t("Fotoğrafı Kırp", "Crop Photo")}</h3>
        <p className="avatar-crop-hint">
          {t(
            "Yakınlaştırıp kaydırarak çerçeveye yerleştir.",
            "Zoom and drag to fit the frame.",
          )}
        </p>

        <div
          ref={viewRef}
          className="avatar-crop-view"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={url}
            alt=""
            draggable={false}
            onLoad={onImgLoad}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: dispW || undefined,
              height: dispH || undefined,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              willChange: "transform",
              userSelect: "none",
              touchAction: "none",
            }}
          />
          <span className="avatar-crop-ring" aria-hidden="true" />
        </div>

        <div className="avatar-crop-zoom">
          <span aria-hidden="true">−</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => applyZoom(Number(e.target.value))}
            aria-label={t("Yakınlaştırma", "Zoom")}
          />
          <span aria-hidden="true">+</span>
        </div>

        <div className="avatar-crop-actions">
          <button
            type="button"
            className="comment-cancel"
            onClick={onCancel}
            disabled={busy}
          >
            {t("İptal", "Cancel")}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={confirm}
            disabled={busy || !nat}
          >
            {busy ? t("Yükleniyor…", "Uploading…") : t("Kaydet", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}
