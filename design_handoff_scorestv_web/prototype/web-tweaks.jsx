/* ScoresTV WEB — Tweaks çubuğu (App state'ine bağlı) */
function TweaksBar({ theme, setTheme, accent, setAccent, homeLayout, setHomeLayout, density, setDensity, pulse, setPulse }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Görünüm" />
      <TweakRadio label="Tema" value={theme}
        options={[{ value: 'dark', label: 'Koyu' }, { value: 'light', label: 'Aydınlık' }]}
        onChange={setTheme} />
      <TweakColor label="Vurgu rengi" value={accent}
        options={['#38BDF8', '#34D399', '#F59E0B', '#A78BFA', '#FF5A5F']}
        onChange={setAccent} />
      <TweakSection label="Ana Sayfa" />
      <TweakRadio label="Düzen" value={homeLayout}
        options={[{ value: 'classic', label: 'Klasik' }, { value: 'focus', label: 'Odak' }]}
        onChange={setHomeLayout} />
      <TweakRadio label="Satır yoğunluğu" value={density}
        options={[{ value: 66, label: 'Ferah' }, { value: 58, label: 'Orta' }, { value: 48, label: 'Sıkı' }]}
        onChange={setDensity} />
      <TweakSection label="Canlı" />
      <TweakToggle label="Nabız animasyonu" value={pulse} onChange={setPulse} />
    </TweaksPanel>
  );
}
window.TweaksBar = TweaksBar;
