# ScoresTV Web — Auth Modülü

Backend'in (`/api/v1/auth`) JWT kimlik sunucusuna bağlı, özel auth katmanı.
NextAuth kullanılmadı; backend zaten access+refresh token üretiyor.

## Mimari
Tarayıcı → Next route proxy (`/api/auth/*`) → Spring backend (`:8080`).
Token'lar **httpOnly cookie**'de tutulur (`stv_at`, `stv_rt`) — JS'e açılmaz.
`/api/auth/me` access token ile `/me` çağırır; 401 ise refresh ile tazeler.

## Çalıştırma
1. Backend'i `:8080`'de çalıştır (CORS zaten `localhost:3000`'e açık).
2. `.env.local` içinde `BACKEND_URL=http://localhost:8080`.
3. `npm run dev` → http://localhost:3000

## Google ile giriş
`.env.local` → `NEXT_PUBLIC_GOOGLE_CLIENT_ID` web OAuth client id'si.
- Backend `application.yml` `security.google.client-ids` listesinde KAYITLI olmalı.
- Google Cloud Console → Authorized JavaScript origins → `http://localhost:3000`.
- Boşsa Google butonu "yapılandırılmadı" uyarısı verir; e-posta girişi çalışır.

## Tasarım/backend uyumu
- Apple girişi YOK (backend desteklemiyor) — tasarımdaki Apple butonu çıkarıldı.
- Kayıt formuna backend zorunlu alanları eklendi: **doğum tarihi + ülke**.
- Doğrulama hataları backend mesajıyla gösterilir (TR).

## Dosya haritası
- `src/lib/` — types, backend fetch, cookie & session çözümleme
- `src/app/api/auth/*` — route proxy'leri (login, register, google, refresh, me, logout, forgot/reset)
- `src/context/` — theme, lang, auth provider + useAuth
- `src/components/auth/` — AuthModal, UserMenu, Google (GIS)
- `src/components/shell/` — Header, Logo
- `src/app/sifremi-unuttum`, `src/app/sifre-sifirla` — şifre akışı sayfaları

## Doğrulama durumu
`tsc --noEmit` ✓ · `eslint` ✓ · `next build` ✓ (14 sayfa, tüm route'lar)
