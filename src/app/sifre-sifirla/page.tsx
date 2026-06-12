"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { useAuth } from "@/context/auth-context";
import { AUTH_STR } from "@/i18n/auth-strings";
import { IconEye, IconLock } from "@/components/icons";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { lang } = useLang();
  const { openAuth } = useAuth();
  const a = AUTH_STR[lang];

  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError(a.missingToken);
      return;
    }
    setBusy(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    let body: { message?: string; errors?: Record<string, string> } | null = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    setBusy(false);
    if (res.ok) {
      setDone(body?.message ?? (lang === "tr" ? "Şifren güncellendi." : "Password updated."));
    } else {
      const msg =
        body?.errors && Object.values(body.errors)[0]
          ? Object.values(body.errors)[0]
          : (body?.message ?? a.genericError);
      setError(msg);
    }
  }

  if (done) {
    return (
      <>
        <div className="auth-success" role="status">
          {done}
        </div>
        <div className="auth-switch" style={{ marginTop: 18 }}>
          <Link href="/" onClick={() => setTimeout(() => openAuth("signin"), 100)}>
            <button>{lang === "tr" ? "Giriş yap" : "Sign in"}</button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}
      <label className="auth-field">
        <span className="af-label">{a.newPass}</span>
        <div className="af-input">
          <span className="af-ic">
            <IconLock s={17} />
          </span>
          <input
            type={show ? "text" : "password"}
            placeholder={a.placePass}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="af-eye"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            <IconEye off={!show} />
          </button>
        </div>
      </label>
      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? <span className="spin dark" /> : null}
        {busy ? a.loading : a.resetSubmit}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { lang } = useLang();
  const a = AUTH_STR[lang];
  return (
    <div className="page-narrow">
      <div className="page-card">
        <h1>{a.resetTitle}</h1>
        <p className="sub">{a.resetSub}</p>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
