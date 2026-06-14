/* ScoresTV WEB — uygulama state + router + mount */
const { useState, useEffect, useMemo, useRef } = React;

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('stv_theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('stv_lang') || 'tr');
  const [accent, setAccent] = useState(() => localStorage.getItem('stv_accent') || '#38BDF8');
  const [sport, setSport] = useState('futbol');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState(0);
  const [favs, setFavs] = useState(() => new Set(JSON.parse(localStorage.getItem('stv_favs') || '[]')));
  const [route, setRoute] = useState({ name: 'home', params: {} });
  const [pulse, setPulse] = useState(true);
  const [homeLayout, setHomeLayout] = useState('classic');
  const [density, setDensity] = useState(60);
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('stv_user') || 'null'); } catch { return null; } });
  const [auth, setAuth] = useState({ open: false, mode: 'signin' });
  const scrollRef = useRef(null);

  useEffect(() => { localStorage.setItem('stv_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('stv_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('stv_accent', accent); }, [accent]);
  useEffect(() => { localStorage.setItem('stv_favs', JSON.stringify([...favs])); }, [favs]);
  useEffect(() => { if (user) localStorage.setItem('stv_user', JSON.stringify(user)); else localStorage.removeItem('stv_user'); }, [user]);

  const openAuth = (mode = 'signin') => setAuth({ open: true, mode });
  const closeAuth = () => setAuth(a => ({ ...a, open: false }));
  const setMode = (mode) => setAuth(a => ({ ...a, mode }));
  const onAuth = (u) => { setUser(u); setAuth(a => ({ ...a, open: false })); };
  const logout = () => setUser(null);

  // tweak köprüsü (tweaks-panel)
  useEffect(() => {
    window.__applyTweak = (k, v) => {
      if (k === 'accent') setAccent(v);
      else if (k === 'theme') setTheme(v);
      else if (k === 'pulse') setPulse(v);
      else if (k === 'homeLayout') setHomeLayout(v);
      else if (k === 'density') document.documentElement.style.setProperty('--row-h', v + 'px');
    };
  }, []);

  const t = STR[lang];
  const toggleFav = (id) => setFavs(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const nav = (name, params = {}) => { setRoute({ name, params }); window.scrollTo({ top: 0, behavior: 'auto' }); };

  const ctx = { t, lang, setLang, theme, setTheme, accent, sport, setSport, status, setStatus, date, setDate, favs, toggleFav, nav, route, pulse, user, openAuth, logout };

  // accent + satır yüksekliği uygula
  useEffect(() => { document.documentElement.style.setProperty('--accent', accent); }, [accent]);
  useEffect(() => { document.documentElement.style.setProperty('--row-h', density + 'px'); }, [density]);

  let content, layoutClass = 'layout';
  if (route.name === 'home') {
    content = <><LeftRail ctx={ctx} /><Home ctx={ctx} /><RightRail ctx={ctx} /></>;
    if (homeLayout === 'focus') { layoutClass = 'layout no-left'; content = <><Home ctx={ctx} /><RightRail ctx={ctx} /></>; }
  } else if (route.name === 'match' && window.MatchPage) {
    content = <window.MatchPage ctx={ctx} id={route.params.id} />; layoutClass = 'layout single';
  } else if (route.name === 'league' && window.LeaguePage) {
    content = <><LeftRail ctx={ctx} /><window.LeaguePage ctx={ctx} id={route.params.id} /><RightRail ctx={ctx} /></>;
  } else if (route.name === 'team' && window.TeamPage) {
    content = <><LeftRail ctx={ctx} /><window.TeamPage ctx={ctx} short={route.params.short} /><RightRail ctx={ctx} /></>;
  } else if (route.name === 'player' && window.PlayerPage) {
    content = <><LeftRail ctx={ctx} /><window.PlayerPage ctx={ctx} name={route.params.name} /><RightRail ctx={ctx} /></>;
  } else if (route.name === 'news' && window.NewsPage) {
    content = <window.NewsPage ctx={ctx} />; layoutClass = 'layout single';
  } else {
    content = <div className="main-col"><div className="card empty"><p>Sayfa hazırlanıyor…</p></div></div>;
    layoutClass = 'layout single';
  }

  return (
    <div className={'app theme-' + theme} data-pulse={pulse ? 1 : 0}>
      <Header ctx={ctx} />
      <Subnav ctx={ctx} />
      <div className={layoutClass}>{content}</div>
      <Footer ctx={ctx} />
      <TweaksBar theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}
        homeLayout={homeLayout} setHomeLayout={setHomeLayout} density={density} setDensity={setDensity}
        pulse={pulse} setPulse={setPulse} />
      <AuthModal open={auth.open} mode={auth.mode} setMode={setMode} onClose={closeAuth} onAuth={onAuth} lang={lang} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
