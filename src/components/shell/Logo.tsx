export function Logo({ h = 28 }: { h?: number }) {
  return (
    <span className="logo-mark" aria-label="ScoresTV">
      {/* Tema'ya göre CSS ile değişir: dark → logo-dark, light → logo-light */}
      {/* eslint-disable-next-line @next/next/no-img-element -- public/ statik logo */}
      <img src="/logo-dark.png" alt="" className="logo-img dark" style={{ height: h }} />
      {/* eslint-disable-next-line @next/next/no-img-element -- public/ statik logo */}
      <img src="/logo-light.png" alt="" className="logo-img light" style={{ height: h }} />
      <span className="logo-text">
        Scores<span className="logo-tv">TV</span>
      </span>
    </span>
  );
}
