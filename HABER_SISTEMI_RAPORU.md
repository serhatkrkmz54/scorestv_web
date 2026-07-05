# ScoresTV — Haber (News) Sistemi Mimari Raporu

> Amaç: Yalnızca **admin/editör** kullanıcıların haber girebildiği; başlık + zengin metin + görsel içeren; **takım / lig / ülke / oyuncu** ilişkilendirmesi yapılabilen; mobilde **favori bazlı veya herkese** push bildirim gönderebilen; ve haber yazımının **ayrı bir yönetim paneli** üzerinden (ileride otomatik haber çekimine de hazır) yürüdüğü kapsamlı bir haber modülü.

---

## 0. Kısa Özet (TL;DR)

Sistem **4 yüzeyden** oluşur:

1. **Backend API** (Spring Boot) — haber CRUD, ilişkilendirme, görsel yükleme, bildirim tetikleme, Elasticsearch indeksleme.
2. **Yönetim Paneli** (ayrı) — editörün haber yazdığı/düzenlediği/sildiği/yayınladığı panel. İleride çekilen haberler DRAFT olarak buraya düşer.
3. **Web Public** (Next.js) — haber liste + detay sayfaları, anasayfa haber rail'i, takım/lig/oyuncu sayfalarında "ilgili haberler".
4. **Mobil** (Flutter) — haber liste + detay ekranı, ilgili haberler, push bildirim + derin bağlantı.

**İyi haber:** Gerekli altyapının çoğu **zaten mevcut** — sadece haber katmanını bağlıyoruz.

---

## 1. Mevcut Durum (Zeminleme)

Keşif sonucu, üç kod tabanında şu hazır parçalar bulundu:

**Backend (`scorestv-backend`)**
- `User` entity + `Role` enum = **ADMIN / EDITOR / USER** (zaten var!). Spring Security JWT + `@EnableMethodSecurity` + `@PreAuthorize("hasRole('EDITOR')")` deseni aktif. `AdminUserController` (`/api/v1/admin/users`) mevcut.
- **Elasticsearch** tam entegre: `TeamDoc / LeagueDoc / PlayerDoc / CountryDoc / CoachDoc / FixtureDoc` indeksli. Arama ucu: `GET /api/v1/search?q=...&types=team,league,player,country`.
- **FCM bildirim** altyapısı: `FcmMessagingService`, `NotificationDispatcher`, güvenilirlik için `notification_outbox` tablosu + dedup, `NotificationMessageBuilder` (cihaz diline göre TR/EN).
- **Favoriler:** `device_match_subscriptions` (cihaz→maç) + per-takım bildirim tercihleri `UserNotificationPref` (cihaz→takım, olay bazlı togglelar). Yani "kullanıcının favori takımı" = cihazın izleme listesindeki takımlar.
- **MinIO/CDN:** `MinioStorageService.upload(objectKey, bytes, mime) → publicUrl`. Anahtar şeması `{tip}/{id}.uzantı`, `cdn.scorestv.com` üzerinden servis.
- **Migration:** en son `V70`. Sıradaki: **V71**.
- **Çok dil:** `name_tr` kolon deseni + endpoint `lang` parametresi + cihaz `locale`.
- Haber entity/servis/tablo = **YOK** (temiz sayfa).

**Web (`scorestv_web`)**
- `NewsList.tsx` (anasayfa sağ rail, **mock** veriyle) + `/haberler` sayfası ("yakında"). CSS sınıfları (`.nl-item`, `.nl-thumb`, `.nl-title`, `.nl-meta`) **hazır**.
- `AppUser.role` (`"ADMIN"|"EDITOR"|"USER"`) tipte var; profil rol etiketini gösteriyor. **Admin UI yok** (rol yalnız görsel).
- BFF deseni olgun: `src/app/api/*` → backend'e Bearer token ile forward, otomatik refresh.
- **Zengin metin editörü YOK** (TipTap/Quill/Slate kurulu değil) — eklenecek.

**Mobil (`scoresmobil`)**
- `FavoritesController` (Riverpod + SharedPreferences) + backend sync. Onboarding'de per-takım bildirim togglaları → `UserNotificationPref`.
- `fcm_service.dart` → `_navigateFromData` derin bağlantı yönlendirmesi (`type` alanına göre). `type: "news"` eklenip `/news/{id}`'ye yönlendirilebilir.
- `news_screen.dart` = **boş placeholder** (hazır iskelet).
- Bildirim tercih ekranları: onboarding + ayarlar.

---

## 2. Veri Modeli (Backend — V71 Migration)

### Ana tablo: `news_articles`

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `slug` | VARCHAR unique | SEO URL (ör. `messi-yeni-rekor-abc123`) |
| `title` / `title_tr` | VARCHAR(255) | Başlık (EN + TR override) |
| `summary` / `summary_tr` | VARCHAR(500) | Kısa özet (liste + OG + bildirim gövdesi) |
| `body` / `body_tr` | TEXT | **Sanitize edilmiş HTML** (zengin editör çıktısı) |
| `cover_image_key` | VARCHAR | MinIO anahtarı (kapak) |
| `status` | VARCHAR(16) | `DRAFT` / `SCHEDULED` / `PUBLISHED` / `ARCHIVED` |
| `category` | VARCHAR(32) | `TRANSFER` / `MATCH` / `INJURY` / `INTERVIEW` / `GENERAL` ... |
| `is_breaking` | BOOLEAN | "Son dakika" bandı için |
| `is_featured` | BOOLEAN | Anasayfada öne çıkan |
| `sport` | VARCHAR(16) | `FOOTBALL` / `BASKETBALL` / `VOLLEYBALL` / `GENERAL` |
| `lang_mode` | VARCHAR(8) | `BILINGUAL` / `TR` / `EN` (hangi diller dolu) |
| `author_id` | BIGINT FK→users | Yazan editör |
| `source` | VARCHAR(64) | `MANUAL` (elle) / ileride `RSS:xxx`, `SCRAPER:xxx` |
| `source_url` | VARCHAR | Çekilen haberin orijinal linki (dedup + atıf) |
| `published_at` | TIMESTAMP | Yayın anı (scheduled ise gelecek) |
| `view_count` | BIGINT | Görüntülenme |
| `reading_minutes` | INT | Tahmini okuma süresi |
| `created_at` / `updated_at` | TIMESTAMP | Optimistik kilit + audit |
| `deleted_at` | TIMESTAMP null | **Soft-delete** (çöp kutusu) |

### İlişkilendirme tabloları (many-to-many)

- `article_team_links (article_id, team_id)`
- `article_league_links (article_id, league_id)`
- `article_country_links (article_id, country_id)`
- `article_player_links (article_id, player_id)`

Hepsi `ON DELETE CASCADE`, `UNIQUE(article_id, entity_id)`, indeksli. Bu tablolar hem "ilgili haberler"i hem de bildirim hedeflemesini besler.

### Ek tablolar

- `news_images (id, article_id, image_key, alt, sort)` — gövde içi görsel galerisi (opsiyonel).
- `news_audit_log (id, article_id, actor_id, action, at, meta)` — kim ne zaman ne yaptı (oluşturma/düzenleme/yayın/silme).
- `news_push_log (id, article_id, target_mode, recipient_count, sent_at)` — hangi habere kime push atıldı (tekrar spam engeli + rapor).

---

## 3. Roller & Yetki

Mevcut `Role` enum kullanılır:

- **EDITOR:** haber oluşturma, düzenleme, kendi/ tüm taslakları yönetme, yayınlama, görsel yükleme, bildirim gönderme.
- **ADMIN:** editörün tüm yetkileri **+** silme (soft-delete/kalıcı), kategori/etiket yönetimi, editör atama, audit log görüntüleme.
- **USER/anonim:** yalnız yayınlanmış haberleri okur.

Uçlar `@PreAuthorize("hasRole('EDITOR')")` / `hasRole('ADMIN')` ile korunur; `@AuthenticationPrincipal CurrentUser` ile yazar kaydı tutulur.

---

## 4. Yönetim Paneli (Ayrı) — Kritik İstek

**Öneri:** Aynı Next.js kod tabanında **izole bir `/admin` route-group** (kendi layout'u, kendi rol-guard'ı) — mümkünse `admin.scorestv.com` subdomain'ine map'li. Neden ayrı app değil de aynı repo altında route-group:
- Auth/BFF/oturum altyapısı **paylaşılır** (tekrar yazmayız).
- Public site kodundan tamamen izole layout (menü, tema) — kullanıcı asla görmez.
- Rol-guard: `EDITOR/ADMIN` değilse `/admin/*` → login/403.
- İleride subdomain'e taşımak kolay.

### Panel ekranları

1. **Haber Listesi** — durum (Taslak/Zamanlanmış/Yayında/Arşiv) sekmeleri, arama, kategori/spor/tarih/ilişkili-varlık filtresi, sayfalama. Her satırda: kapak küçük görsel, başlık, durum, yazar, tarih, görüntülenme, hızlı aksiyonlar (**Düzenle / Yayınla-Geri Çek / Önizle / Kopyala / Sil**).
2. **Haber Oluştur/Düzenle** — başlık(TR/EN), özet, zengin editör (§5), kapak yükleme, ilişkilendirme (§6), kategori/etiket, spor, son-dakika/öne-çıkan, yayın (hemen/zamanla), **bildirim hedefi** (§7). Otomatik taslak kaydı (autosave).
3. **Medya Kütüphanesi** — yüklenen görseller, tekrar kullanım.
4. **Gelen Kutusu (İleride)** — çekilen haberler DRAFT olarak buraya düşer; editör inceler, düzenler, yayınlar veya siler. Kaynak URL ile dedup.
5. **Audit / Log** (ADMIN) — kim ne yaptı.

> Panel bu şekilde kurulunca, "ileride haber çekersek bu panele düşeceğiz" isteği doğal olarak karşılanır: ingestion pipeline sadece `status=DRAFT, source=SCRAPER:x` kayıtları oluşturur; panelin geri kalanı (düzenleme/silme/yayın) aynen çalışır.

---

## 5. Zengin Metin Editörü (Çok Sağlam Olmalı)

**Öneri: TipTap** (ProseMirror tabanlı, React, headless, en genişletilebilir editör). Neden: sıkıntısız, modüler, geniş eklenti ekosistemi, kontrollü HTML çıktısı.

**Özellikler:** başlıklar (H2–H4), kalın/italik/altı-çizili/üstü-çizili, listeler, alıntı (blockquote), bağlantı, **görsel (sürükle-bırak + yapıştır → MinIO'ya otomatik yükleme)**, YouTube/Twitter/Instagram gömme, tablo, ayraç (HR), hizalama, geri/ileri al, kod bloğu, dipnot/kaynak.

**Saklama:** **Sanitize edilmiş HTML** (`body`), opsiyonel olarak ProseMirror JSON (yeniden düzenlenebilirlik için). Mobil, HTML'i `flutter_widget_from_html` ile render eder.

**Kritik güvenlik:** Editör çıktısı **sunucu tarafında mutlaka sanitize edilmeli** (backend'de jsoup allow-list veya web BFF'te DOMPurify) — aksi halde stored-XSS. Bu, JSON-LD XSS düzeltmesiyle aynı disiplin.

---

## 6. İlişkilendirme + Elasticsearch

Editör, ilişkilendirme alanında yazmaya başlayınca mevcut `GET /api/v1/search?q=...&types=team,league,player,country` ucu ile **çoklu-varlık otomatik tamamlama** çalışır (edge-ngram, ASCII-folding, popülerlik boost — hazır). Seçilenler "chip" olarak eklenir, `article_*_links` tablolarına yazılır.

Ayrıca haberin kendisi **`ArticleDoc` olarak ES'e indekslenir** → hem haber içi arama, hem "ilgili haberler", hem hedeflemede hız.

---

## 7. Bildirim Sistemi (Push)

### Hedefleme modları (editör panelde seçer)

- **Herkes:** bildirimi açık tüm cihazlar (opsiyonel: spora göre süz).
- **İlgili favoriler:** haberin ilişkili varlıklarını favorileyenler. Alıcı çözümleme zinciri:
  - İlişkili **takım** → o takımı izleyen cihazlar (`UserNotificationPref.team_id`) + o takımın maçını favorileyenler (`device_match_subscriptions`).
  - İlişkili **lig** → ligdeki takımları izleyen cihazlar.
  - İlişkili **oyuncu** → oyuncunun güncel takımını izleyenler.
  - İlişkili **ülke** → o ülkenin milli takımını/kulüplerini izleyenler.

### Akış
Editör "Bildirim gönder" kutusunu işaretler + hedefi seçer → backend alıcıları çözer → mevcut **`notification_outbox` + dedup + batch FCM** hattından geçirir → cihaz diline göre TR/EN başlık/gövde → **görselli (rich) bildirim** → tıklayınca `type: "news", articleId` payload'ı ile `/news/{id}` derin bağlantısı.

### Anti-spam & tercih
- Bildirim **her kayıtta otomatik değil** — editör açıkça işaretlerse gider (düzenleme spam'ini önler). `news_push_log` ile aynı haber ikinci kez atılırsa uyarı.
- Mobilde yeni **"Haberler"** bildirim toggle'ı (opt-out): kullanıcı haber push'unu kapatabilir.
- Throttle: kısa sürede çok haber → kuyruk hız freni.

---

## 8. Görsel Yükleme (MinIO/CDN)

- Uç: `POST /api/v1/news/images` (multipart, EDITOR). Anahtar şeması: `articles/{articleId}/{uuid}.{ext}` (kapak: `articles/{id}/cover.jpg`).
- Doğrulama: MIME beyaz liste (jpg/png/webp), boyut limiti, yeniden boyutlandırma + thumbnail üretimi (liste için hafif sürüm).
- CDN üzerinden servis (`cdn.scorestv.com/...`) — tüm görseller CDN'den (mevcut disiplin).

---

## 9. Public Gösterim

### Web
- `/haberler` — sayfalı liste, kategori filtreleri, öne çıkan + son dakika bandı, sonsuz kaydırma. (mock `NewsList` → gerçek veri.)
- `/haber/[slug]` — detay: kapak, başlık, meta (yazar/tarih/okuma süresi), sanitize HTML gövde, ilişkili varlık çipleri (takım/lig/oyuncu sayfalarına link), **ilgili haberler**, sosyal paylaşım. **SEO:** `NewsArticle` JSON-LD, OG/Twitter kartları, breadcrumb, sitemap'e ekleme, yayında IndexNow ping.
- Anasayfa sağ rail + takım/lig/oyuncu detay sayfalarında **"İlgili Haberler"** bölümü.

### Mobil
- `NewsScreen` (placeholder → gerçek liste), haber detay ekranı (HTML render), takım/maç/oyuncu sayfalarında ilgili haberler, derin bağlantı yönetimi.

---

## 10. Gelecek: Otomatik Haber Çekimi (Ingestion)

Panel baştan buna hazır tasarlanır: bir ingestion işi (RSS/scraper) → `news_articles(status=DRAFT, source=SCRAPER:x, source_url=...)` kaydı + kaynak URL hash'i ile **dedup**. Editör gelen kutusundan inceler, düzenler, ilişkilendirir, yayınlar veya siler. Kod açısından ekstra iş yok — sadece bir "DRAFT üreten" besleyici.

---

## 11. Güvenlik & Kalite

- **Stored-XSS koruması** (HTML sanitize) — en kritik madde.
- Rol gate'leri (`@PreAuthorize`), görsel MIME/boyut doğrulaması, rate-limit.
- **Soft-delete** + çöp kutusu (yanlış silme kurtarılır); kalıcı silme yalnız ADMIN.
- **Audit log** (kim/ne/ne zaman) + optimistik kilit (`updated_at`).
- Autosave taslak (veri kaybı yok).

---

## 12. Benim Eklediğim Öneriler (mantıklı ilaveler)

- **TR/EN çift dil** (uygulama zaten iki dilli — haber de olmalı).
- **Kategoriler + etiketler**, **son dakika** bandı, **öne çıkan/sabitlenen** haber.
- **Görüntülenme sayısı**, **okuma süresi**, **yazar künyesi + avatar**.
- **Zamanlanmış yayın** (ileri tarihli).
- **Yorum entegrasyonu:** mevcut yorum sistemi habere de bağlanabilir (etkileşim).
- **Editoryal akış:** Taslak → (İnceleme) → Yayın; rol bazlı.
- **İlgili haberler** (ES benzerliği + ortak varlık).
- **Sosyal paylaşım + OG görselleri**, **RSS çıkışı** (SEO/dağıtım).
- **Görselli push** bildirim (etkileşimi artırır).

---

## 13. Faz Planı (Yol Haritası)

| Faz | Kapsam | Yüzey | Mağaza etkisi |
|---|---|---|---|
| **0** | Kararların onayı (§15) | — | — |
| **1** | V71 migration + entity + CRUD + rol gate + sanitize | Backend | Anında |
| **2** | Yönetim paneli + TipTap editör + görsel yükleme + ilişkilendirme | Panel/Web | Anında |
| **3** | Public web: liste + detay + SEO + ilgili haberler | Web | Anında |
| **4** | Mobil: liste + detay + ilgili haberler + **push + toggle + deep-link** | Mobil | **Yeni build + mağaza** |
| **5** | ES `ArticleDoc` + haber araması + ilgili-haber benzerliği | Backend/Web | Anında |
| **6** | Ingestion gelen kutusu (haber çekimi) | Backend/Panel | Anında |

---

## 14. Mağaza Etkisi (Standing Rule)

- **Backend + Web + Panel** değişiklikleri → **deploy edince anında canlı**, mağaza güncellemesi gerekmez.
- **Mobil** haber ekranı + push işleme + "Haberler" toggle → **yeni uygulama sürümü** gerekir (Play + App Store incelemesi). Mevcut kullanıcılar güncelleyene kadar bu ekranları görmez; ama backend'e eklenen alanlar additive olduğu için eski uygulama **hata almaz**.

---

## 15. Onayınıza Sunulan Kararlar (öyle ilerleyelim)

1. **Panel konumu:** Aynı Next.js altında izole `/admin` route-group (önerilen, hızlı) — veya ayrı subdomain/app?
2. **Editör çıktısı:** Sanitize HTML (önerilen) — veya HTML+JSON birlikte?
3. **Dil modeli:** Tek haberde TR+EN birlikte (önerilen) — veya dil başına ayrı haber, ya da tek dil?
4. **Bildirim varsayılanı:** Editör her haberde açıkça "Bildirim gönder"i işaretlemeli (önerilen, spam önler) + varsayılan hedef "İlgili favoriler" mi "Herkes" mi?
5. **Başlangıç fazı:** Faz 1'den (backend) mi başlayalım, yoksa önce panel+editör prototipini mi görmek istersin?
