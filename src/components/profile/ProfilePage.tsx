"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AvatarCropModal } from "./AvatarCropModal";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { COUNTRIES, countryLabel } from "@/lib/countries";
import {
  IconCalendar,
  IconGlobe,
  IconLock,
  IconLogout,
  IconMail,
  IconUser,
} from "@/components/icons";

type Msg = { type: "ok" | "err"; text: string } | null;

const TODAY = new Date().toISOString().slice(0, 10);

export function ProfilePage() {
  const { user, loading, openAuth, refresh, logout, uploadAvatar, removeAvatar } = useAuth();
  const { lang } = useLang();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  // ── Profil resmi (avatar) ──
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<Msg>(null);
  // Kırpma modalına verilecek seçilen dosya (null → modal kapalı).
  const [cropFile, setCropFile] = useState<File | null>(null);

  // ── Profil düzenleme ──
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<Msg>(null);

  // ── Şifre değiştir ──
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
      setBirthDate(user.birthDate ?? "");
      setCountry(user.country ?? "");
    }
  }, [user]);

  const dirty = useMemo(() => {
    if (!user) return false;
    return (
      displayName.trim() !== (user.displayName ?? "") ||
      birthDate !== (user.birthDate ?? "") ||
      country !== (user.country ?? "")
    );
  }, [user, displayName, birthDate, country]);

  const roleLabel = (r: string) =>
    r === "ADMIN"
      ? t("Yönetici", "Admin")
      : r === "EDITOR"
        ? t("Editör", "Editor")
        : t("Üye", "Member");

  const initial = (user?.displayName || user?.email || "U").trim().charAt(0).toUpperCase();

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosya tekrar seçilebilsin
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarMsg({ type: "err", text: t("Yalnızca görsel yükleyebilirsin.", "You can only upload an image.") });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      // Kırpma öncesi ham dosya sınırı geniş; kırpılan çıktı zaten küçük olur.
      setAvatarMsg({ type: "err", text: t("Görsel en fazla 20 MB olabilir.", "Image can be at most 20 MB.") });
      return;
    }
    setAvatarMsg(null);
    setCropFile(file); // kırpma modalını aç
  }

  // Kırpma onaylanınca: kare blob'u File'a sarıp yükle.
  async function onCropConfirm(blob: Blob) {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    setAvatarBusy(true);
    const r = await uploadAvatar(file);
    setAvatarBusy(false);
    setCropFile(null);
    setAvatarMsg(
      r.ok
        ? { type: "ok", text: t("Profil resmi güncellendi.", "Profile photo updated.") }
        : { type: "err", text: r.error || t("Yüklenemedi. Tekrar dene.", "Upload failed. Try again.") },
    );
  }

  async function onRemoveAvatar() {
    setAvatarMsg(null);
    setAvatarBusy(true);
    const r = await removeAvatar();
    setAvatarBusy(false);
    setAvatarMsg(
      r.ok
        ? { type: "ok", text: t("Profil resmi kaldırıldı.", "Profile photo removed.") }
        : { type: "err", text: r.error || t("Kaldırılamadı.", "Remove failed.") },
    );
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveMsg(null);
    if (!displayName.trim() || !birthDate || !country) {
      setSaveMsg({ type: "err", text: t("Lütfen tüm alanları doldur.", "Please fill all fields.") });
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), birthDate, country }),
      });
      if (r.status === 401) {
        openAuth("signin");
        return;
      }
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { message?: string } | null;
        throw new Error(j?.message);
      }
      await refresh();
      setSaveMsg({ type: "ok", text: t("Profil güncellendi.", "Profile updated.") });
    } catch (err) {
      setSaveMsg({
        type: "err",
        text: (err as Error)?.message || t("Güncellenemedi. Tekrar dene.", "Update failed. Try again."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (!curPw || !newPw) {
      setPwMsg({ type: "err", text: t("Mevcut ve yeni şifreyi gir.", "Enter current and new password.") });
      return;
    }
    if (newPw.length < 3) {
      setPwMsg({ type: "err", text: t("Yeni şifre en az 3 karakter olmalı.", "New password must be at least 3 characters.") });
      return;
    }
    if (newPw !== newPw2) {
      setPwMsg({ type: "err", text: t("Yeni şifreler eşleşmiyor.", "New passwords do not match.") });
      return;
    }
    setPwSaving(true);
    try {
      const r = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      if (r.status === 401) {
        openAuth("signin");
        return;
      }
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { message?: string } | null;
        throw new Error(j?.message);
      }
      setCurPw("");
      setNewPw("");
      setNewPw2("");
      setPwMsg({ type: "ok", text: t("Şifren güncellendi.", "Password updated.") });
    } catch (err) {
      setPwMsg({
        type: "err",
        text: (err as Error)?.message || t("Şifre değiştirilemedi.", "Could not change password."),
      });
    } finally {
      setPwSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <p className="match-empty">{t("Yükleniyor…", "Loading…")}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-signedout">
          <span className="profile-signedout-ic">
            <IconUser s={26} />
          </span>
          <h1>{t("Profilini görmek için giriş yap", "Sign in to view your profile")}</h1>
          <p>
            {t(
              "Hesabını yönetmek, bilgilerini düzenlemek ve favorilerini takip etmek için giriş yapmalısın.",
              "Sign in to manage your account, edit your details and follow your favorites.",
            )}
          </p>
          <div className="profile-signedout-actions">
            <button className="btn-primary" onClick={() => openAuth("signin")}>
              {t("Giriş Yap", "Sign In")}
            </button>
            <Link href="/" className="comment-cancel">
              {t("Ana sayfa", "Home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Google ile oluşturulmuş hesap (yerel şifre yok) → şifre formu yerine bilgi.
  const googleOnly = user.hasPassword === false;

  return (
    <div className="profile-page">
      <nav className="static-breadcrumb" aria-label="breadcrumb">
        <Link href="/">{t("Ana sayfa", "Home")}</Link>
        <span aria-hidden="true">/</span>
        <span className="cur">{t("Profilim", "My Profile")}</span>
      </nav>

      <div className="profile-layout">
        {/* Sol: kimlik kartı + çıkış */}
        <aside className="profile-aside">
          <div className="profile-id">
            <span className="profile-id-glow" aria-hidden="true" />
            <div className="profile-id-av">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.displayName || t("Profil resmi", "Profile photo")} />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="profile-av-actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => void onPickAvatar(e)}
              />
              <button
                type="button"
                className="profile-av-btn"
                disabled={avatarBusy}
                onClick={() => fileRef.current?.click()}
              >
                {avatarBusy
                  ? t("Yükleniyor…", "Uploading…")
                  : user.avatarUrl
                    ? t("Değiştir", "Change")
                    : t("Fotoğraf Ekle", "Add Photo")}
              </button>
              {user.avatarUrl ? (
                <button
                  type="button"
                  className="profile-av-btn is-ghost"
                  disabled={avatarBusy}
                  onClick={() => void onRemoveAvatar()}
                >
                  {t("Kaldır", "Remove")}
                </button>
              ) : null}
            </div>
            {avatarMsg ? <p className={`pf-msg ${avatarMsg.type}`}>{avatarMsg.text}</p> : null}
            <h2 className="profile-id-name">{user.displayName || t("Üye", "Member")}</h2>
            <span className="profile-id-mail">
              <IconMail s={14} /> {user.email}
            </span>
            <div className="profile-id-chips">
              <span className="profile-chip is-accent">{roleLabel(user.role)}</span>
              {user.country ? <span className="profile-chip">{user.country}</span> : null}
              {user.age != null ? (
                <span className="profile-chip">
                  {user.age} {t("yaş", "yrs")}
                </span>
              ) : null}
            </div>
          </div>
          <button className="profile-logout" type="button" onClick={() => void logout()}>
            <IconLogout s={16} /> {t("Çıkış Yap", "Sign out")}
          </button>
        </aside>

        {/* Sağ: formlar */}
        <div className="profile-main">
          {/* Profil bilgileri / düzenleme */}
          <section className="profile-card">
            <header className="profile-card-head">
              <h2>{t("Profil Bilgileri", "Profile Details")}</h2>
              <p>{t("Adını, doğum tarihini ve ülkeni güncelle.", "Update your name, birth date and country.")}</p>
            </header>

            <form className="profile-form" onSubmit={saveProfile}>
              <label className="pf-field">
                <span className="pf-label">{t("Ad Soyad", "Full name")}</span>
                <div className="pf-input">
                  <span className="pf-ic"><IconUser s={17} /></span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={100}
                    placeholder={t("Adın", "Your name")}
                    autoComplete="name"
                  />
                </div>
              </label>

              <label className="pf-field">
                <span className="pf-label">{t("E-posta", "Email")}</span>
                <div className="pf-input is-readonly">
                  <span className="pf-ic"><IconMail s={17} /></span>
                  <input type="email" value={user.email} readOnly disabled />
                </div>
                <span className="pf-hint">{t("E-posta değiştirilemez.", "Email cannot be changed.")}</span>
              </label>

              <div className="pf-grid">
                <label className="pf-field">
                  <span className="pf-label">{t("Doğum tarihi", "Date of birth")}</span>
                  <div className="pf-input">
                    <span className="pf-ic"><IconCalendar s={17} /></span>
                    <input
                      type="date"
                      value={birthDate}
                      max={TODAY}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                </label>

                <label className="pf-field">
                  <span className="pf-label">{t("Ülke", "Country")}</span>
                  <div className="pf-input">
                    <span className="pf-ic"><IconGlobe s={17} /></span>
                    <select value={country} onChange={(e) => setCountry(e.target.value)}>
                      <option value="" disabled>
                        {t("Ülke seç", "Select country")}
                      </option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={countryLabel(c, lang)}>
                          {countryLabel(c, lang)}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              </div>

              {saveMsg ? <p className={`pf-msg ${saveMsg.type}`}>{saveMsg.text}</p> : null}

              <div className="pf-actions">
                <button className="btn-primary" type="submit" disabled={saving || !dirty}>
                  {saving ? t("Kaydediliyor…", "Saving…") : t("Değişiklikleri Kaydet", "Save Changes")}
                </button>
              </div>
            </form>
          </section>

          {/* Şifre değiştir VEYA Google bilgisi */}
          {googleOnly ? (
            <section className="profile-card profile-note">
              <span className="profile-note-ic">
                <IconLock s={20} />
              </span>
              <div className="profile-note-body">
                <h2>{t("Şifre", "Password")}</h2>
                <p>
                  {t(
                    "Bu hesaba Google ya da Apple ile giriş yapıyorsun. Şifre yönetimi ilgili sağlayıcı (Google/Apple) üzerinden yapılır; burada değiştirilemez.",
                    "You sign in with Google or Apple. Your password is managed through that provider and can't be changed here.",
                  )}
                </p>
              </div>
            </section>
          ) : (
            <section className="profile-card">
              <header className="profile-card-head">
                <h2>{t("Şifre Değiştir", "Change Password")}</h2>
                <p>{t("Hesabını güvende tut, güçlü bir şifre seç.", "Keep your account safe with a strong password.")}</p>
              </header>

              <form className="profile-form" onSubmit={changePassword}>
                <label className="pf-field">
                  <span className="pf-label">{t("Mevcut şifre", "Current password")}</span>
                  <div className="pf-input">
                    <span className="pf-ic"><IconLock s={17} /></span>
                    <input
                      type="password"
                      value={curPw}
                      onChange={(e) => setCurPw(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                  </div>
                </label>

                <div className="pf-grid">
                  <label className="pf-field">
                    <span className="pf-label">{t("Yeni şifre", "New password")}</span>
                    <div className="pf-input">
                      <span className="pf-ic"><IconLock s={17} /></span>
                      <input
                        type="password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                      />
                    </div>
                  </label>

                  <label className="pf-field">
                    <span className="pf-label">{t("Yeni şifre (tekrar)", "New password (again)")}</span>
                    <div className="pf-input">
                      <span className="pf-ic"><IconLock s={17} /></span>
                      <input
                        type="password"
                        value={newPw2}
                        onChange={(e) => setNewPw2(e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                      />
                    </div>
                  </label>
                </div>

                {pwMsg ? <p className={`pf-msg ${pwMsg.type}`}>{pwMsg.text}</p> : null}

                <div className="pf-actions">
                  <button className="btn-primary" type="submit" disabled={pwSaving}>
                    {pwSaving ? t("Güncelleniyor…", "Updating…") : t("Şifreyi Güncelle", "Update Password")}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>

      {cropFile ? (
        <AvatarCropModal
          file={cropFile}
          lang={lang}
          busy={avatarBusy}
          onCancel={() => {
            if (!avatarBusy) setCropFile(null);
          }}
          onConfirm={onCropConfirm}
        />
      ) : null}
    </div>
  );
}
