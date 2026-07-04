// JSON-LD string'ini <script type="application/ld+json"> içine GÜVENLİ gömmek
// için kaçışlar. JSON.stringify `<` `>` `&` karakterlerini kaçışlamaz; bir
// değer `</script>` içerirse etiket kapanıp XSS'e yol açabilir. Bu üç karakteri
// geçerli JSON \u kaçışlarına çevirerek hem tag-breakout'u önler hem JSON-LD'yi
// geçerli bırakırız (parser <'yi tekrar `<` olarak çözer).
// Not: type="application/ld+json" içeriği JS olarak ÇALIŞTIRILMAZ (yalnız veri),
// bu yüzden U+2028/U+2029 satır ayırıcılarını kaçışlamaya gerek yoktur.
export function escapeJsonLd(json: string | null | undefined): string {
  if (!json) return "";
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
