"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { AUTH_STR } from "@/i18n/auth-strings";
import { IconMail } from "@/components/icons";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { lang } = useLang();
  const a = AUTH_STR[lang];

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const r = await forgotPassword(email);
    setBusy(false);
    if (r.ok) {
      setDone(r.message ?? (lang === "tr" ? "Bağlantı gönderildi." : "Link sent."));
    } else {
      setError(r.error ?? a.genericError);
    }
  }

  return (
    <div className="page-narrow">
      <div className="page-card">
        <h1>{a.forgotTitle}</h1>
        <p className="sub">{a.forgotSub}</p>

        {done ? (
          <>
            <div className="auth-success" role="status">
              {done}
            </div>
            <div className="auth-switch" style={{ marginTop: 18 }}>
              <Link href="/">
                <button>{a.backToHome}</button>
              </Link>
            </div>
          </>
        ) : (
          <form className="auth-form" onSubmit={onSubmit}>
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}
            <label className="auth-field">
              <span className="af-label">{a.email}</span>
              <div className="af-input">
                <span className="af-ic">
                  <IconMail s={17} />
                </span>
                <input
                  type="email"
                  placeholder={a.placeEmail}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? <span className="spin dark" /> : null}
              {busy ? a.loading : a.forgotSubmit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
