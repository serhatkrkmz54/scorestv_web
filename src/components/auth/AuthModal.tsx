"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthMode } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { AUTH_STR } from "@/i18n/auth-strings";
import { COUNTRIES, countryLabel } from "@/lib/countries";
import { Logo } from "@/components/shell/Logo";
import {
  GoogleMark,
  IconCalendar,
  IconClose,
  IconEye,
  IconGlobe,
  IconLock,
  IconMail,
  IconUser,
} from "@/components/icons";
import { GOOGLE_CLIENT_ID, triggerGoogleSignIn } from "./google";

type Busy = "google" | "email" | null;

/** Dış kabuk: kapalıyken hiç render etmez; her açılışta inner yeniden mount olur (temiz state). */
export function AuthModal() {
  const { authOpen } = useAuth();
  if (!authOpen) return null;
  return <AuthModalInner />;
}

function AuthModalInner() {
  const {
    authMode,
    closeAuth,
    setAuthMode,
    login,
    register,
    loginWithGoogle,
    needsGoogleCompletion,
    completeGoogleSignUp,
    cancelGoogleCompletion,
  } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const a = AUTH_STR[lang];
  const isUp = authMode === "signup";

  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [remember, setRemember] = useState(true);

  // Google completion paneli icin ayri form alanlari — normal kayit form'undan
  // bagimsiz tutuyoruz ki kullanici geri donerse degerler karismasin.
  const [gcBirthDate, setGcBirthDate] = useState("");
  const [gcCountry, setGcCountry] = useState("");

  // Esc kapatma + body scroll kilidi (harici sistem effect'i)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [closeAuth]);

  const switchMode = useCallback(
    (m: AuthMode) => {
      setError(null);
      setAuthMode(m);
    },
    [setAuthMode],
  );

  const handleGoogle = useCallback(async () => {
    setError(null);
    setBusy("google");
    const started = await triggerGoogleSignIn(async (idToken) => {
      const r = await loginWithGoogle(idToken);
      // needsCompletion ise hata gosterme — context state'i panele gecisi
      // tetikledi. Sadece gercek hatalarda hata mesaji set et.
      if (!r.ok && !r.needsCompletion) setError(r.error ?? a.genericError);
    });
    if (!started) setError(a.googleUnavailable);
    setBusy(null);
  }, [a, loginWithGoogle]);

  /** Google tamamlama paneli — "Tamamla" butonu */
  const handleGoogleComplete = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!gcBirthDate) {
        setError(a.birthDateRequired);
        return;
      }
      if (!gcCountry) {
        setError(a.countryRequired);
        return;
      }
      setBusy("google");
      const r = await completeGoogleSignUp({
        birthDate: gcBirthDate,
        country: gcCountry,
      });
      if (!r.ok) setError(r.error ?? a.genericError);
      setBusy(null);
    },
    [a, completeGoogleSignUp, gcBirthDate, gcCountry],
  );

  /** Google tamamlama paneli — "Vazgec" butonu */
  const handleGoogleCancel = useCallback(() => {
    setError(null);
    setGcBirthDate("");
    setGcCountry("");
    cancelGoogleCompletion();
  }, [cancelGoogleCompletion]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (isUp && password !== password2) {
        setError(a.pwMismatch);
        return;
      }

      setBusy("email");
      const result = isUp
        ? await register({ email, password, displayName: name, birthDate, country })
        : await login({ email, password, rememberMe: remember });

      if (!result.ok) {
        setError(result.error ?? a.genericError);
        setBusy(null);
      }
      // başarılıysa context modalı kapatır (inner unmount olur)
    },
    [isUp, password, password2, a, register, login, email, name, birthDate, country, remember],
  );

  const goForgot = useCallback(() => {
    closeAuth();
    router.push("/sifremi-unuttum");
  }, [closeAuth, router]);

  return (
    <div className="auth-overlay" onMouseDown={closeAuth}>
      <div
        className="auth-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="auth-close" onClick={closeAuth} aria-label="Kapat">
          <IconClose s={18} />
        </button>

        <div className="auth-head">
          <div className="auth-logo">
            <Logo h={26} />
          </div>
          <h2>{needsGoogleCompletion ? a.googleCompleteTitle : a.welcome}</h2>
          <p>{needsGoogleCompletion ? a.googleCompleteSub : a.subtitle}</p>
        </div>

        {!needsGoogleCompletion && (
          <div className="auth-tabs">
            <button className={!isUp ? "on" : ""} onClick={() => switchMode("signin")}>
              {a.tabIn}
            </button>
            <button className={isUp ? "on" : ""} onClick={() => switchMode("signup")}>
              {a.tabUp}
            </button>
            <span
              className="auth-tab-ind"
              style={{ transform: isUp ? "translateX(100%)" : "translateX(0)" }}
            />
          </div>
        )}

        {needsGoogleCompletion ? (
          <div className="auth-body">
            {error && (
              <div className="auth-error" role="alert" style={{ marginBottom: 13 }}>
                {error}
              </div>
            )}
            <form className="auth-form" onSubmit={handleGoogleComplete}>
              <label className="auth-field">
                <span className="af-label">{a.birthDate}</span>
                <div className="af-input">
                  <span className="af-ic">
                    <IconCalendar s={17} />
                  </span>
                  <input
                    name="gcBirthDate"
                    type="date"
                    value={gcBirthDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setGcBirthDate(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="auth-field">
                <span className="af-label">{a.country}</span>
                <div className="af-input">
                  <span className="af-ic">
                    <IconGlobe s={17} />
                  </span>
                  <select
                    name="gcCountry"
                    value={gcCountry}
                    onChange={(e) => setGcCountry(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      {a.countryPlaceholder}
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={countryLabel(c, lang)}>
                        {countryLabel(c, lang)}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <button className="auth-submit" type="submit" disabled={!!busy}>
                {busy === "google" ? <span className="spin dark" /> : null}
                {busy === "google" ? a.loading : a.googleCompleteSubmit}
              </button>

              <button
                type="button"
                className="auth-link"
                style={{ marginTop: 12, textAlign: "center", width: "100%" }}
                onClick={handleGoogleCancel}
                disabled={!!busy}
              >
                {a.authCancel}
              </button>
            </form>
          </div>
        ) : (
        <div className="auth-body">
          <button className="prov-btn google" disabled={!!busy} onClick={handleGoogle} type="button">
            {busy === "google" ? <span className="spin" /> : <GoogleMark s={19} />}
            <span>{busy === "google" ? a.loading : a.google}</span>
          </button>

          <div className="auth-divider">
            <span>{a.or}</span>
          </div>

          {error && (
            <div className="auth-error" role="alert" style={{ marginBottom: 13 }}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {isUp && (
              <label className="auth-field">
                <span className="af-label">{a.name}</span>
                <div className="af-input">
                  <span className="af-ic">
                    <IconUser s={17} />
                  </span>
                  <input
                    name="name"
                    type="text"
                    placeholder={a.placeName}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span className="af-label">{a.email}</span>
              <div className="af-input">
                <span className="af-ic">
                  <IconMail s={17} />
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder={a.placeEmail}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span className="af-label">{a.pass}</span>
              <div className="af-input">
                <span className="af-ic">
                  <IconLock s={17} />
                </span>
                <input
                  name="pass"
                  type={showPass ? "text" : "password"}
                  placeholder={a.placePass}
                  autoComplete={isUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="af-eye"
                  onClick={() => setShowPass((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  <IconEye off={!showPass} />
                </button>
              </div>
            </label>

            {isUp && (
              <>
                <label className="auth-field">
                  <span className="af-label">{a.passAgain}</span>
                  <div className="af-input">
                    <span className="af-ic">
                      <IconLock s={17} />
                    </span>
                    <input
                      name="pass2"
                      type={showPass ? "text" : "password"}
                      placeholder={a.placePass}
                      autoComplete="new-password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span className="af-label">{a.birthDate}</span>
                  <div className="af-input">
                    <span className="af-ic">
                      <IconCalendar s={17} />
                    </span>
                    <input
                      name="birthDate"
                      type="date"
                      value={birthDate}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span className="af-label">{a.country}</span>
                  <div className="af-input">
                    <span className="af-ic">
                      <IconGlobe s={17} />
                    </span>
                    <select
                      name="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        {a.countryPlaceholder}
                      </option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={countryLabel(c, lang)}>
                          {countryLabel(c, lang)}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              </>
            )}

            {!isUp && (
              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>{a.remember}</span>
                </label>
                <button type="button" className="auth-link" onClick={goForgot}>
                  {a.forgot}
                </button>
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={!!busy}>
              {busy === "email" ? <span className="spin dark" /> : null}
              {busy === "email" ? a.loading : isUp ? a.doUp : a.doIn}
            </button>
          </form>

          {isUp && <p className="auth-terms">{a.terms}</p>}

          <div className="auth-switch">
            {isUp ? a.hasAcc : a.noAcc}{" "}
            <button onClick={() => switchMode(isUp ? "signin" : "signup")}>
              {isUp ? a.switchIn : a.switchUp}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export { GOOGLE_CLIENT_ID };
