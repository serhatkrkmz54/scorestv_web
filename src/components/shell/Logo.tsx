export function Logo({ h = 28 }: { h?: number }) {
  return (
    <span className="logo-mark" aria-label="ScoresTV">
      {/* Tema'ya göre CSS ile değişir: dark tema → logo-dark, light tema → logo-light.
          Yazi kaldirildi; artik sadece gorsel logo gosterilir. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- public/ statik logo */}
      <img src="/logo-dark.png" alt="ScoresTV" className="logo-img dark" style={{ height: h }} />
      {/* eslint-disable-next-line @next/next/no-img-element -- public/ statik logo */}
      <img src="/logo-light.png" alt="ScoresTV" className="logo-img light" style={{ height: h }} />
    </span>
  );
}
