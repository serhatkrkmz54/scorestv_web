// Backend'e ulaşılamadığında (5xx / zaman aşımı) detay sayfalarının 200 +
// "bulunamadı" başlığı render etmek yerine GERÇEK hata fırlatması için.
// Next.js en yakın error boundary'yi (app/error.tsx) HTTP 500 ile render eder.
//
// SEO gerekçesi: Google 5xx'i "geçici sunucu hatası" sayar — indexli sayfayı
// düşürmez, hatalı başlığı da indexlemez. 200 + "bulunamadı" ise soft-404
// olarak INDEXLENIR (Search Console'da yaşandı); 404 dönmek ise gerçek
// sayfayı index'ten sildirir. Doğru sinyal: 5xx.
export function backendUnavailable(): never {
  throw new Error("BACKEND_UNAVAILABLE");
}
