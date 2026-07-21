export function Logo({ h = 40 }: { h?: number }) {
  return (
    <span className="logo-mark" aria-label="Scores TV">
      {/* Tema'ya göre CSS ile değişir: dark tema → logo-dark, light tema → logo-light.
          Yazi kaldirildi; artik sadece gorsel logo gosterilir. */}
      {/* width/height ATTRIBUTELERI = intrinsic boyut (649x120 / 653x120). Tarayıcı
          bunlardan aspect-ratio'yu çıkarıp yükleme ÖNCESİNDE yatay yer ayırır →
          logo geç yüklenince kayma OLMAZ (CLS fix). CSS height + width:auto ile
          görsel boyut korunur. Görseller ~5KB'ye optimize edildi (eskiden 258KB). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- public/ statik logo */}
      <img src="/logo-dark.png" alt="Scores TV" className="logo-img dark" width={649} height={120} style={{ height: h }} />
      {/* eslint-disable-next-line @next/next/no-img-element -- public/ statik logo */}
      <img src="/logo-light.png" alt="Scores TV" className="logo-img light" width={653} height={120} style={{ height: h }} />
    </span>
  );
}
