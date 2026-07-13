# Uygulama indirme + scorestv.app kurulumu

Uygulamalar mağazalarda onaylandı. Web tarafında kullanıcıları doğru mağazaya
yönlendiren her şey eklendi. Bu dosya **kod tarafında ne yapıldığını** ve
**Cloudflare'de scorestv.app'i nasıl bağlayacağını** anlatır.

## Mağaza linkleri
- App Store: https://apps.apple.com/us/app/scores-tv-live-scores/id6782667299
- Google Play: https://play.google.com/store/apps/details?id=com.scorestv.mobile

Kodda tek yerde: `src/lib/store-links.ts`. İstersen yeniden derlemeden ENV ile ez:
```
NEXT_PUBLIC_APPSTORE_URL=https://apps.apple.com/us/app/scores-tv-live-scores/id6782667299
NEXT_PUBLIC_PLAYSTORE_URL=https://play.google.com/store/apps/details?id=com.scorestv.mobile
```

## Kod tarafında eklenenler (scorestv.com deploy edilince aktif)
- **`/indir` ve `/download`** — akıllı indirme sayfası: iPhone/iPad → App Store,
  Android → Play Store'a **otomatik yönlendirir**; masaüstü ve arama motoru
  botları iki rozetli landing görür (indekslenebilir kalır).
- **Footer** — her sayfada "Uygulamayı indir" App Store + Google Play rozetleri.
- **Anasayfa mobil banner** — mobil tarayıcıda alttan çıkan, kapatılabilir küçük
  indirme banner'ı. Yalnızca anasayfada gösterilir → **uygulamanın kendi
  WebView'ında görünmez.**
- **iOS Smart App Banner** — Safari'de sayfanın en üstünde Apple'ın yerel
  banner'ı (`apple-itunes-app` meta). Uygulama kuruluysa açar, değilse App
  Store'a götürür.
- **middleware** — `scorestv.app` host'una gelen istek `scorestv.com/indir`'e gider.

## scorestv.app'i akıllı indirme domaini yapmak

`scorestv.com` ana web uygulaması olarak kalır. `scorestv.app`'i pazarlamada/
QR'da verilecek **tek kısa adres** yap; cihaza göre doğru mağazaya atsın.
Aşağıdaki yollardan **birini** seç.

### Yol A — Cloudflare Redirect Rule (önerilen, en basit, kod yok)
1. Cloudflare Dashboard → **scorestv.app** → **Rules → Redirect Rules → Create rule**.
2. **When incoming requests match:** Hostname `equals` `scorestv.app`
   (OR ekleyip `www.scorestv.app` de koy).
3. **Then:** Type = **Static**, URL = `https://scorestv.com/indir`,
   Status = **302**, Preserve query string = kapalı.
4. Save & Deploy.
5. DNS: scorestv.app kaydı **Proxied (turuncu bulut)** olmalı. Sunucu yoksa
   `AAAA` kaydı `100::` (proxied) ekle — redirect rule için yeterli.

Akış: `scorestv.app` → `scorestv.com/indir` → cihaza göre mağaza. (2 hop)

### Yol B — Cloudflare Worker (tek hop, en hızlı)
Workers & Pages → **Create Worker** → kodu yapıştır → **Triggers**'a route ekle:
`scorestv.app/*` (ve istersen `www.scorestv.app/*`).

```js
export default {
  async fetch(request) {
    const APPSTORE = "https://apps.apple.com/us/app/scores-tv-live-scores/id6782667299";
    const PLAY = "https://play.google.com/store/apps/details?id=com.scorestv.mobile";
    const LANDING = "https://scorestv.com/indir";
    const ua = (request.headers.get("user-agent") || "").toLowerCase();
    const isBot = /bot|crawler|spider|facebookexternalhit|slurp|whatsapp|telegrambot|applebot/.test(ua);
    let target = LANDING;
    if (!isBot) {
      if (/iphone|ipad|ipod/.test(ua)) target = APPSTORE;
      else if (/android/.test(ua)) target = PLAY;
    }
    return Response.redirect(target, 302);
  },
};
```

### Yol C — Domaini bu Next app'e ekle
scorestv.app'i hosting'e (Vercel vb.) domain olarak ekle. Kod içindeki
middleware host'u zaten yakalayıp `/indir`'e atıyor; ekstra kural gerekmez.

## Test
- iPhone Safari → `scorestv.app` → App Store.
- Android Chrome → `scorestv.app` → Google Play.
- Masaüstü → iki rozetli indirme sayfası.
- `scorestv.com/indir` da birebir aynı çalışır (paylaşımlarda bunu da kullanabilirsin).

## Sonraki adım (opsiyonel) — Derin bağlantı
Link **uygulama kuruluysa uygulamada** açılsın istersen: iOS Universal Links
(apple-app-site-association) + Android App Links (assetlinks.json). Bunun için
app bundle id, Apple Team ID ve Android imza SHA-256 gerekir ve muhtemelen yeni
bir app build. İstersen ayrı bir adımda kurarız.
