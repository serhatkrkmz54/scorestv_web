"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { IconFlame } from "@/components/icons";

/**
 * "Hata bildir" — maç/takım/lig sayfalarından kullanıcı veri katkısı gönderir.
 * Katkı yalnız inceleme kuyruğuna düşer (API verisine dokunmaz); onaylanırsa
 * kullanıcı Scores Puanı kazanır. Giriş yoksa auth modalı açılır.
 */
interface Props {
  sport: "football" | "basketball" | "volleyball";
  targetType: "FIXTURE" | "TEAM" | "LEAGUE" | "PLAYER";
  targetId: number;
  targetLabel: string;
  lang: "tr" | "en";
}

const TYPES: { key: string; tr: string; en: string }[] = [
  { key: "SCORE", tr: "Skor hatalı", en: "Wrong score" },
  { key: "STATUS", tr: "Maç durumu / erteleme", en: "Match status / postponed" },
  { key: "LINEUP", tr: "Kadro hatalı/eksik", en: "Wrong or missing lineup" },
  { key: "TV_CHANNEL", tr: "TV kanalı hatalı/eksik", en: "Wrong or missing TV channel" },
  { key: "MISSING_DATA", tr: "Eksik veri", en: "Missing data" },
  { key: "OTHER", tr: "Diğer", en: "Other" },
];

export function ReportIssueButton({ sport, targetType, targetId, targetLabel, lang }: Props) {
  const { user, openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("SCORE");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  function openModal() {
    if (!user) {
      openAuth("signin");
      return;
    }
    setDone(null);
    setError(null);
    setOpen(true);
  }

  async function submit() {
    if (message.trim().length < 10) {
      setError(t("Lütfen en az 10 karakterlik bir açıklama yazın.", "Please write at least 10 characters."));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport,
          type,
          targetType,
          targetId,
          targetLabel,
          message: message.trim(),
        }),
      });
      if (r.status === 401) {
        setOpen(false);
        openAuth("signin");
        return;
      }
      const body = (await r.json()) as { remainingToday?: number; message?: string };
      if (!r.ok) {
        setError(body.message ?? t("Gönderilemedi, tekrar deneyin.", "Could not send, try again."));
        return;
      }
      setMessage("");
      setDone(
        t(
          "Teşekkürler! Bildirimin incelemeye alındı — onaylanırsa Scores Puanı kazanacaksın.",
          "Thanks! Your report is under review — you will earn Scores Points if approved.",
        ),
      );
    } catch {
      setError(t("Bağlantı hatası, tekrar deneyin.", "Connection error, try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="ri-btn" onClick={openModal}>
        <IconFlame s={13} />
        {t("Hata bildir · puan kazan", "Report an issue · earn points")}
      </button>

      {open && (
        <div className="ri-overlay" onClick={() => setOpen(false)}>
          <div className="ri-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ri-title">{t("Hata bildir", "Report an issue")}</div>
            <div className="ri-target">{targetLabel}</div>

            {done ? (
              <>
                <p className="ri-done">{done}</p>
                <div className="ri-actions">
                  <button type="button" className="ri-submit" onClick={() => setOpen(false)}>
                    {t("Kapat", "Close")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="ri-label">{t("Sorun türü", "Issue type")}</label>
                <select
                  className="ri-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {TYPES.map((o) => (
                    <option key={o.key} value={o.key}>
                      {lang === "tr" ? o.tr : o.en}
                    </option>
                  ))}
                </select>

                <label className="ri-label">
                  {t("Açıklama (neyin yanlış olduğunu yaz)", "Description (what is wrong)")}
                </label>
                <textarea
                  className="ri-input ri-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder={t(
                    "ör. Skor 2-1 olmalı, ikinci gol 78. dakikada atıldı.",
                    "e.g. The score should be 2-1, the second goal was in the 78th minute.",
                  )}
                />

                {error && <p className="ri-error">{error}</p>}

                <div className="ri-actions">
                  <button type="button" className="ri-cancel" onClick={() => setOpen(false)}>
                    {t("Vazgeç", "Cancel")}
                  </button>
                  <button type="button" className="ri-submit" disabled={busy} onClick={submit}>
                    {busy ? t("Gönderiliyor…", "Sending…") : t("Gönder", "Send")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
