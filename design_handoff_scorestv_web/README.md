# Handoff: ScoresTV Web — Canlı Skor & İstatistik Platformu

> Bu paket, bir geliştiricinin (Claude Code dahil) tasarımı **gerçek bir Next.js kod tabanında** hayata geçirmesi için hazırlanmıştır. Bu dokümandaki her ölçü, renk ve davranış nihaidir.

---

## 1. Genel Bakış

ScoresTV, **Flashscore + Mackolik** tarzında, modern ve ferah bir canlı skor / istatistik web platformudur. Futbol, basketbol, tenis ve voleybol branşlarını kapsar. Çok dilli (TR/EN), koyu/açık temalı ve ayarlanabilir vurgu renklidir.

Ana yetenekler:
- Canlı skorlar (ana sayfa) — lig lig gruplanmış maç listesi, tarih şeridi, durum filtreleri
- Maç detay — özet/zaman çizelgesi, istatistik, diziliş (saha), karşılaşmalar (H2H), tahmin
- Lig — puan durumu, fikstür, gol krallığı
- Takım — genel, **hafta-hafta seçilebilir fikstür**, premium kadro, sezon istatistikleri
- Oyuncu — sezon istatistikleri + radar yetenek grafiği
- Haberler — **otomatik geçişli manşet slider** + kart ızgarası
- Giriş/Kayıt modalı — Google + Apple ile giriş, e-posta formu
- Sağ rayda **X/Twitter gündem akışı** ve öne çıkan maç

---

## 2. Tasarım Dosyaları Hakkında

`prototype/` klasöründeki dosyalar **HTML/React (Babel-in-browser) ile hazırlanmış tasarım referanslarıdır** — niyetlenen görünüm ve davranışı gösteren prototiplerdir, doğrudan kopyalanacak production kodu **değildir**.

Görev: bu tasarımları hedef kod tabanının ortamında (**Next.js + React**) o ortamın yerleşik desenleri ve kütüphaneleriyle **yeniden inşa etmektir**. Veri katmanı prototipte statik bir `data.js` ile taklit edilmiştir; gerçek uygulamada bir spor verisi API'sine (ör. canlı skor sağlayıcısı, WebSocket ile canlı güncelleme) bağlanmalıdır.

### Mimari öneri (Next.js)
- **App Router** (`app/`) — her ekran bir route: `/`, `/mac/[id]`, `/lig/[id]`, `/takim/[short]`, `/oyuncu/[name]`, `/haberler`
- Sunucu bileşenleri ile veri çekme + canlı veriler için client bileşen / WebSocket
- Tema ve dil için Context (veya `next-themes` + `next-intl`)
- Auth için **NextAuth.js** (Google + Apple provider) — modaldaki `onAuth` callback'i gerçek `signIn('google')` ile değiştirilir
- İkonlar prototipte inline SVG; istenirse `lucide-react` gibi bir set ile eşlenebilir (bkz. ikon listesi §9)

---

## 3. Fidelity: **Yüksek (hi-fi)**

Tüm mockuplar piksel hassasiyetinde; nihai renkler, tipografi, boşluk ve etkileşimler içerir. UI birebir yeniden oluşturulmalıdır. Aşağıdaki tüm değerler gerçektir.

---

## 4. Tasarım Token'ları

### 4.1 Tipografi
- **Tek font ailesi: `Rajdhani`** (Google Fonts), ağırlıklar: 400, 500, 600, 700. Yedek: `system-ui, sans-serif`.
- Sayısal hizalama için skor/istatistiklerde `font-variant-numeric: tabular-nums` (`.tnum`).
- Logo da Rajdhani 700 ile çizilir (SVG metin) — bkz. §9.

Ölçek (gerçek kullanılan boyutlar):
| Kullanım | Boyut / Ağırlık |
|---|---|
| Sayfa başlığı (h2) | 22px / 700 |
| Hero takım adı | 26px / 700 |
| Maç skoru (detay) | 56px / 700 |
| Maç satırı skoru | 21px / 700 |
| Takım adı (satır) | 15.5px / 600 |
| Kart başlığı (h3) | 13px / 700, `text-transform:uppercase`, `letter-spacing:.09em` |
| Gövde/etiket | 13–15px / 500–700 |
| Küçük etiket | 11–12px / 600–700 |

### 4.2 Renkler — CSS değişkenleri (token'lar tema sınıfında tanımlı)

**Koyu tema (`.theme-dark`)**
```
--bg:#0A0D13;  --bg-2:#070A0F;
--surface:#11161F;  --surface-2:#161D28;  --surface-3:#202836;
--border:rgba(255,255,255,.07);  --border-2:rgba(255,255,255,.13);
--text:#EEF2F7;  --text-dim:#93A0B0;  --text-faint:#58626F;
--live:#FF4D5E;
--shadow:0 8px 30px rgba(0,0,0,.45);
--pitch-a:#1f7a44;  --pitch-b:#1c7040;
```

**Açık tema (`.theme-light`)**
```
--bg:#EBEEF3;  --bg-2:#E2E7EE;
--surface:#FFFFFF;  --surface-2:#F4F7FA;  --surface-3:#E7ECF2;
--border:rgba(13,20,31,.09);  --border-2:rgba(13,20,31,.16);
--text:#0F1722;  --text-dim:#5B6675;  --text-faint:#99A3AF;
--live:#E0304A;
--shadow:0 10px 34px rgba(20,30,48,.12);
--pitch-a:#2f9255;  --pitch-b:#2b8a4f;
```

**Tema-bağımsız sabitler (`:root`)**
```
--accent: kullanıcı seçer, varsayılan #38BDF8 (Tweaks ile değişir)
--accent-ink:#08111a   (accent üzerindeki metin)
--uel:#34D399  --rel:#E5364B  --win:#22C55E   (Avrupa/küme/galibiyet bölge renkleri)
```

Vurgu rengi seçenekleri (Tweaks): `#38BDF8 (varsayılan), #34D399, #F59E0B, #A78BFA, #FF5A5F`.

> **ÖNEMLİ — degrade YOK.** Tüm yüzeyler düz tek renktir. Tint gerektiğinde `color-mix(in srgb, var(--accent) 12%, var(--surface))` gibi düz karışım kullanılır, asla `linear/radial-gradient` değil. Tek istisna: haber slider'ında metin okunabilirliği için **düz** yarı-saydam koyu panel (`rgba(7,10,15,.62)`).

### 4.3 Boşluk / Yarıçap / Layout
```
--maxw:1480px        (içerik max genişlik)
--rail-l:268px       (sol ray)
--rail-r:344px       (sağ ray)
--gap:22px           (kolon arası)
--header-h:60px      (üst bar)
--subnav-h:52px      (spor sekmeleri barı)
--radius:16px        (kart)
--radius-sm:11px     (buton/küçük)
```
Kart kenarlığı: `1px solid var(--border)`. Maç satırı min-yüksekliği: `--row-h` (varsayılan 60px, Tweaks ile 48/58/66).

### 4.4 Bayraklar / Armalar
- **Takım arması**: monogram placeholder — daire, takım rengi zemin, beyaz kısa kod (`GS`, `FB`...). Gerçek uygulamada gerçek logolarla değiştirilir.
- **Bayraklar**: inline SVG (daire içinde). Gerçek uygulamada bayrak seti/CDN ile değiştirilebilir.

---

## 5. Global Düzen (Shell)

Sıralı dikey yapı: `Header` → `Subnav` → `.layout` (grid) → `Footer`. Üstte modallar (Auth) ve Tweaks paneli portal gibi en sona render edilir.

### 5.1 Header (`--header-h:60px`, sticky, blur)
- Sol: **Logo** (yükseklik 26px, tıklayınca ana sayfa)
- Orta: **Arama** kutusu (max 440px, 40px yüksek, `--surface-2` zemin, sol arama ikonu, sağda `/` kısayol etiketi)
- Sağ (`.h-actions`): Bildirim ikon-butonu · Tema değiştir (güneş/ay) · **TR/EN segment toggle** · **Giriş butonu** (accent zemin) **veya** giriş yapılmışsa **kullanıcı hapı** (`UserMenu`)
- Header zemini: `--header-bg` (yarı saydam) + `backdrop-filter: blur(18px) saturate(140%)`, alt kenarlık `--border`.

### 5.2 Subnav (`--subnav-h:52px`, sticky, header altında)
- Spor sekmeleri: **Futbol, Basketbol, Tenis, Voleybol** — her biri ikon + ad + (varsa canlı maç sayacı, `--live` renkli).
- Aktif sekmede altta 2.5px accent çizgi.
- Sağ uçta **Haberler** sekmesi.

### 5.3 Layout grid (`.layout`)
- `grid-template-columns: 268px minmax(0,1fr) 344px; gap:22px; max-width:1480px;`
- `.layout.no-left` (Odak düzeni): sol ray gizli → `1fr 344px`
- `.layout.single` (maç/haber sayfası): tek kolon, max 1080px
- Raylar `position:sticky`, kendi içinde kaydırılır. **Ray çocuklarına `flex-shrink:0` ZORUNLU** (yoksa `overflow:hidden`li kart flex'te çöker — bu hata yaşandı ve düzeltildi).
- Responsive: `≤1180px` sol ray gizlenir; `≤880px` sağ ray gizlenir.

---

## 6. Ekranlar

### 6.1 Ana Sayfa — Canlı Skorlar
**Sol ray:** Favoriler (lig listesi) · Ülkeler ağacı (açılır-kapanır lig grupları) · Uygulama promo kartı (iOS/Android).
**Orta kolon:**
- **Tarih şeridi** (`.date-strip`): sol/sağ ok + kaydırılabilir günler; bugün vurgulu, seçili gün accent zemin. Yanında "Takvim" butonu.
- **Filtre çipleri**: Tümü / Canlı (sayaç + nokta) / Yakında / Bitenler.
- **Lig blokları** (`.league-block`): başlıkta bayrak + lig adı + ülke/round + "Puan Durumu" linki + aç/kapa. İçinde **maç satırları**.

**Maç satırı (`.mrow`)** — grid `58px 1fr 92px 1fr 96px`, min-yükseklik `--row-h`:
- Durum: canlı ise `--live` renkte dakika + nabız noktası; yaklaşan ise saat; biten ise "Bitti" + İY skoru.
- Ev sahibi (sağa hizalı isim + arma) · Skor (`21px/700`, kaybeden `--text-dim`) · Deplasman (arma + isim) · Sağ uç: uzatma/pen rozeti, **İzle** butonu, **favori yıldızı**.
- Canlı satırın solunda 3px `--live` şerit. Tüm satır tıklanınca maç detayına gider.

**Sağ ray:** Öne çıkan maç → X/Twitter akışı → Son dakika (bkz. §6.7).

### 6.2 Maç Detay (`.match-page`, tek kolon shell)
- **Hero**: üst şerit (geri, lig, round, favori, paylaş) + ortada büyük skor (56px) / VS, İY-90' alt bilgi, uzatma rozeti, altında "İzle" CTA.
- **Sekmeler** (`.seg-tabs`): Özet · İstatistik · Diziliş (yalnız futbol) · Karşılaşmalar.
- İçerik gridi: ana kolon + 320px yan (Maç Bilgisi kartı: tarih, saat, hakem, stat, kanal).
  - **Özet**: periyot gruplu **zaman çizelgesi** (gol/kart/oyuncu değişikliği/VAR ikonları, ortada dakika + skor) + **Tahmin** (1/X/2 oy barları).
  - **İstatistik**: çift taraflı yüzde barları (ev=accent, dep=`--text-faint`).
  - **Diziliş**: taraf seçici + **yatay saha** (düz yeşil `--pitch-a`, orta çizgi + ceza sahaları beyaz) üstünde forma noktaları (numara, kaptan "C", reyting rozeti) + yedekler listesi.
  - **H2H**: galibiyet dağılımı (W-D-L barı) + son karşılaşmalar listesi.

### 6.3 Lig Sayfası
- **Hero** (`.lg-hero`): düz tint zemin (`--lc` lig rengi %13 + surface), amblem, lig adı/ülke/round, canlı sayaç.
- Sekmeler: **Puan Durumu** (tam tablo: #, takım, O G B M Av, son-5 form rozetleri, P; sol bölge renkleri UCL/UEL/küme + alt açıklama) · **Fikstür** (lig maç bloğu) · **Gol Krallığı** (sıra, oyuncu, gol/asist).

### 6.4 Takım Sayfası
- **Hero** (`.tm-hero`): düz tint, arma (72px), ad/ülke/stat/şehir, son-5 form, sağda lig sırası + **Takip Et** butonu.
- **Sezon istatistik şeridi** (`.tm-stats`, 4 hücre): Atılan / Yenilen / Gól Yemeden / Maç Başı Gol — **her hücrenin sağ alt köşesinde takım renginde DÜZ (opak ~%14) ikon** (top / kale filesi / eldiven / grafik). Değer+etiket sola hizalı.
- Künye şeridi (`.tm-facts`): teknik direktör, kuruluş, stat, şehir.
- Sekmeler:
  - **Genel**: iki kolon — Son Maçlar + Gelecek Maçlar (sonuç rozeti, lig, ev/dep, rakip, skor/saat).
  - **Kadro (PREMIUM)** — bkz. §6.4.1.
  - **Fikstür (HAFTA-HAFTA SEÇİLEBİLİR)** — bkz. §6.4.2.

#### 6.4.1 Premium Kadro
- Mevki grupları: **Kaleci / Defans / Ortasaha / Forvet**. Grup başlığı: takım renginde ikon kutusu (eldiven/kalkan/top/krampon) + ad + sayı pili + sağda rol etiketi (GK/DEF/MID/FWD).
- **Oyuncu kartı** (`.sq-card`, grid `minmax(158px,1fr)`): üstte **takım renginde 4px düz şerit**, **forma SVG** (takım rengi tişört + beyaz yaka + sırt numarası), oyuncu adı, milliyet bayrağı + ülke. Kaptanda sağ üstte sarı "C" rozeti. Profili olan oyuncuda hover'da kart yükselir (translateY -4px) + takım renkli kenarlık + sağ altta ok; tıklayınca oyuncu sayfası.

#### 6.4.2 Hafta-Hafta Fikstür (`TeamFixtures`)
- **Hafta şeridi** (`.wk-strip-wrap`): sol/sağ ok + kaydırılabilir "HAFTA 1…34" butonları (gizli scrollbar). Güncel hafta accent metinli, seçili hafta accent zemin. Seçili hafta otomatik ortalanır (`scrollLeft` ile — `scrollIntoView` KULLANMA).
- **Seçili hafta maç kartı** (`.wk-match`): başlıkta "Hafta N" + tarih (oynanmışsa) / kickoff (yaklaşan) / CANLI. Gövde: ev (isim+arma) — skor (`32px`) veya **VS** — deplasman (arma+isim), kaybeden taraf soluk. Altta sonuç etiketi (Galibiyet/Mağlubiyet/Beraberlik/Yaklaşan) + iç saha/deplasman · stat.
- Prototipte haftalar/skorlar deterministik üretilir (`buildWeeks`); gerçekte API'den gelir.

### 6.5 Oyuncu Sayfası
- **Hero** (`.pl-hero`): forma numarası kutusu (takım rengi), ad, takım+mevki linki, sağda sezon reytingi.
- Künye şeridi: uyruk, yaş, boy, ayak, değer.
- İki kolon: **Sezon istatistikleri** (3'lü grid: O, gol, asist, reyting, dakika, sarı/kırmızı) + **Radar yetenek grafiği** (SVG poligon, 6 eksen).
- **Son maçlar** listesi (lig, rakip, skor, G/A, reyting rozeti).

### 6.6 Haberler Sayfası
- Başlık + **Manşet Slider** (`NewsSlider`) — bkz. §7.3 davranış.
  - 360px yükseklik, ilk 4 haber. Tam genişlik slayt: arka planda monogram (Thumb), düz `rgba(8,11,16,.32)` scrim, altta düz `rgba(7,10,15,.62)` panel içinde kategori çipi (accent), başlık (28px, max 2 satır), özet, zaman.
  - Sol/sağ yuvarlak oklar; sağ üstte ilerleme noktaları (aktif olan uzar, 24px).
- Altında **haber kartı ızgarası** (`minmax(260px,1fr)`): her kart üstte monogram + kategori çipi, başlık, zaman.

### 6.7 Sağ Ray Bileşenleri
- **Öne Çıkan Maç** (`.feat`): üstte "ÖNE ÇIKAN MAÇ" + canlı dakika. İki **satır** (ev/dep): arma(30px)+isim+skor; lider takımda yeşil ok ve net renk, diğeri soluk. Altta lig·hafta. En altta İzle + Özet butonları.
- **X / Twitter Gündem akışı** (`TwitterFeed`): kart başlığı X logosu + "Gündem" + "Takip Et" (siyah pill). Tweet'ler: avatar (hesap rengi monogram), ad, **mavi doğrulama tiki** (`#1D9BF0`), `@handle`, zaman, metin, alt aksiyonlar (yanıt/retweet/beğeni sayıları ikonlu).
- **Son Dakika** haber listesi (küçük thumb + başlık + kategori·zaman).

---

## 7. Etkileşim & Davranış

### 7.1 Genel
- Tüm navigasyon client-side route ile; sayfa değişince `window.scrollTo(top)`.
- Favori maçlar `localStorage` (`stv_favs`) ile kalıcı.
- Tema (`stv_theme`), dil (`stv_lang`), vurgu (`stv_accent`), kullanıcı (`stv_user`) `localStorage`'da kalıcı.
- Canlı nokta nabzı: `@keyframes pulse`; Tweaks ile kapatılabilir.

### 7.2 Giriş/Kayıt Modalı (`AuthModal`)
- Header "Giriş" → modal açılır. Backdrop blur + pop animasyonu. Esc veya dışarı tık ile kapanır; açıkken `body` scroll kilidi.
- **Sekmeler**: Giriş Yap / Kayıt Ol (kayan gösterge). Kayıtta ek alanlar: Ad Soyad + Şifre (tekrar).
- **Sağlayıcılar**: "Google ile devam et" (orijinal renkli logo) + "Apple ile devam et" (siyah). Tıklayınca spinner → ~850ms sonra `onAuth(user)`.
- E-posta formu: e-posta + şifre (göster/gizle), "beni hatırla" + "şifremi unuttum"; submit → `onAuth`.
- Giriş sonrası header'da **UserMenu** (avatar + ad + açılır menü: Favorilerim, Bildirimler, Hesap Ayarları, Çıkış). Dışarı tık ile kapanır.
- **Next.js'te**: `onAuth` ve sağlayıcı butonlarını NextAuth `signIn('google'|'apple')` / credentials akışına bağla. Kullanıcı durumu session'dan gelir.

### 7.3 Haber Slider (`NewsSlider`)
- `idx` state; track `translateX(-idx*100%)`, geçiş `.55s cubic-bezier(.4,0,.2,1)`.
- **Otomatik geçiş**: 5sn `setInterval`; **hover'da durur** (`onMouseEnter/Leave` → paused).
- Sol/sağ ok ile `(idx±1+n)%n`; noktalar ile doğrudan seçim.
- `useEffect` cleanup ile interval temizlenir.

### 7.4 Tweaks Paneli
- Toolbar'dan açılır (host protokolü). Kontroller: Tema (koyu/açık) · Vurgu rengi (5 swatch) · Ana sayfa düzeni (Klasik/Odak) · Satır yoğunluğu (Ferah/Orta/Sıkı → `--row-h`) · Canlı nabız (toggle).
- **Next.js'te bu paneli ÜRETİME taşımana gerek yok** — yalnızca tasarımın hangi eksenlerde değişebileceğini gösterir. Tema/dil/vurgu gerçek ayar menüsüne taşınabilir.

### 7.5 Animasyon/geçiş süreleri
- Hover arka plan: `.12–.17s`. Kart yükselme: `.17s cubic-bezier(.3,.8,.4,1)`. Modal pop: `.22s`. Slider: `.55s`. Sekme göstergesi: `.22s`.

---

## 8. State Yönetimi (prototipteki `App`)

Tek üst bileşende tutulan state'ler (Next.js'te Context/route/session'a dağıtılır):
- `theme, lang, accent` → tema/dil/vurgu (kalıcı)
- `sport` → aktif spor sekmesi
- `status` → ana sayfa filtre (all/live/upcoming/finished)
- `date` → seçili gün ofseti
- `favs (Set)` → favori maç id'leri (kalıcı)
- `route {name, params}` → basit router (Next.js'te App Router route'ları)
- `user` → giriş bilgisi (kalıcı; Next.js'te NextAuth session)
- `auth {open, mode}` → modal durumu
- `pulse, homeLayout, density` → Tweaks değerleri

**Veri**: prototipte `window.SCORES` (statik). Gerçekte: ligler, maçlar, puan durumu, kadro, oyuncu, haber, tweet uçları için API + canlı maçlar için WebSocket/polling.

---

## 9. İkonlar & Logo

- **Logo**: Rajdhani 700 ile SVG metin "ScoresTV" + accent renkli "V" çentiği (bkz. `web-ui.jsx` → `Logo`). Koyu/açık temada metin `var(--text)` ile uyumlanır.
- **İkonlar**: tümü inline SVG, `web-ui.jsx` içindeki `I` objesinde: search, user, star, play, chevron'lar, sun, moon, calendar, ball, basket, voley, tennis, trophy, globe, bell, tv, news, share, pin, clock, whistle, shirt, filter, apple, android, close, net, gloves, chart, shield, boot, x (twitter), reply, retweet, heart. Next.js'te `lucide-react` vb. ile eşlenebilir; spor/forma/eldiven gibi özel olanlar inline SVG kalabilir.

---

## 10. Dosyalar (prototype/)

| Dosya | İçerik |
|---|---|
| `ScoresTV Web.html` | Giriş noktası; font + CSS + script sırası |
| `web-styles.css` | Ana tasarım sistemi (token, shell, tüm bileşenler) |
| `web-auth.css` | Giriş modalı + kullanıcı menüsü stilleri |
| `web-ui.jsx` | Logo, ikon seti (`I`), arma, bayraklar, spor ikonu, canlı etiket, thumb |
| `web-shell.jsx` | Header, Subnav, sol ray, maç satırı, lig bloğu, footer |
| `web-home.jsx` | Ana sayfa, tarih şeridi, sağ ray, **TwitterFeed** |
| `web-match.jsx` | Maç detay (hero, timeline, istatistik, diziliş, H2H, tahmin) |
| `web-pages.jsx` | Lig, Takım (+**TeamFixtures**), Oyuncu (+radar), **NewsSlider** + Haberler |
| `web-auth.jsx` | **AuthModal** + **UserMenu** + Google/Apple logoları |
| `web-app.jsx` | Üst `App`: state, router, mount |
| `web-i18n.js` | TR/EN sözlük (`STR`) |
| `web-extra.js` | Veri eklentisi: tenis, haberler, tweetler, oyuncu/takım profilleri |
| `web-tweaks.jsx`, `tweaks-panel.jsx` | Tweaks paneli (yalnız tasarım keşfi için) |
| `assets/data.js` | Demo veri seti (ligler, maçlar, puan durumu, gol krallığı, detaylar) |
| `assets/ScoresTV-logo*.png` | Logo varyasyonları (referans) |

### Çalıştırma
`ScoresTV Web.html`'i bir tarayıcıda aç (script'ler göreli yollarla yüklenir). React/Babel CDN'den gelir; internet gerekir.

---

## 11. Notlar / Yapılacaklar (gerçek uygulama)
- Armalar ve haber/oyuncu görselleri **monogram placeholder** — gerçek logo/görsel ile değiştir.
- Bayraklar basitleştirilmiş SVG — gerçek bayrak seti ile değiştirilebilir.
- Detaylı veriler (diziliş, istatistik, oyuncu) yalnız örnek maç/takımlar için dolu; API'ye bağlanınca tümü dinamik olur.
- Canlı maçlar için gerçek zamanlı güncelleme (WebSocket) eklenmeli.
- Erişilebilirlik: butonlarda `aria-label` mevcut; klavye navigasyonu ve odak halkaları production'da gözden geçirilmeli.
