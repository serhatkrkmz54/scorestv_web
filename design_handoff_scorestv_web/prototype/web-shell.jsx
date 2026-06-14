/* ScoresTV WEB — uygulama kabuğu: header, subnav, raylar, maç satırı, lig bloğu */

/* ════════════════ HEADER ════════════════ */
function Header({ ctx }) {
  const { t, theme, setTheme, lang, setLang, nav, user, openAuth, logout } = ctx;
  return (
    <header className="header">
      <div className="header-in">
        <div className="logo" onClick={() => nav('home')}><Logo h={26} /></div>
        <div className="search">
          <span className="s-ico"><I.search s={17} /></span>
          <input placeholder={t.search} />
          <kbd>/</kbd>
        </div>
        <div className="h-actions">
          <button className="h-btn icon" title={t.notifications}><I.bell s={19} /></button>
          <button className="h-btn icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Tema">
            {theme === 'dark' ? <I.sun s={19} /> : <I.moon s={19} />}
          </button>
          <div className="seg-toggle">
            <button className={lang === 'tr' ? 'on' : ''} onClick={() => setLang('tr')}>TR</button>
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          {user
            ? <UserMenu user={user} onLogout={logout} lang={lang} />
            : <button className="login-btn" onClick={() => openAuth('signin')}><I.user s={16} /> {t.login}</button>}
        </div>
      </div>
    </header>
  );
}

/* ════════════════ SUBNAV (spor sekmeleri) ════════════════ */
function Subnav({ ctx }) {
  const { t, sport, setSport, nav, route } = ctx;
  const S = window.SCORES;
  const sports = [
    { id: 'futbol', label: 'Futbol', en: 'Football', ico: I.ball },
    { id: 'basket', label: 'Basketbol', en: 'Basketball', ico: I.basket },
    { id: 'tenis', label: 'Tenis', en: 'Tennis', ico: I.tennis },
    { id: 'voleybol', label: 'Voleybol', en: 'Volleyball', ico: I.voley },
  ];
  const liveCount = (sp) => S.matches.filter(m => S.leagues[m.league].sport === sp && m.status === 'live').length;
  return (
    <div className="subnav">
      <div className="subnav-in">
        {sports.map(s => {
          const lc = liveCount(s.id);
          const on = route.name === 'home' && sport === s.id;
          return (
            <button key={s.id} className={'sport-tab' + (on ? ' on' : '')} onClick={() => { setSport(s.id); nav('home'); }}>
              <s.ico s={17} /> {ctx.lang === 'tr' ? s.label : s.en}
              {lc > 0 && <span className="cnt" style={{ color: 'var(--live)' }}>{lc}</span>}
            </button>
          );
        })}
        <div className="subnav-spacer" />
        <button className={'sport-tab' + (route.name === 'news' ? ' on' : '')} onClick={() => nav('news')}>
          <I.news s={17} /> {t.news}
        </button>
      </div>
    </div>
  );
}

/* ════════════════ SOL RAIL ════════════════ */
function LeftRail({ ctx }) {
  const { t, nav, favs, sport } = ctx;
  const S = window.SCORES;
  const [open, setOpen] = React.useState({});
  // sporun ligleri ülkeye göre
  const leaguesForSport = Object.values(S.leagues).filter(l => l.sport === sport);
  const byCountry = {};
  leaguesForSport.forEach(l => { (byCountry[l.country] = byCountry[l.country] || []).push(l); });

  const favLeagues = Object.values(S.leagues).filter(l => ['superlig','premier','ucl'].includes(l.id));

  return (
    <aside className="rail-left">
      <div className="rl-section">
        <div className="rl-head"><span className="flame"><Flame /></span> {t.favorites}</div>
        {favLeagues.map(l => (
          <button key={l.id} className="rl-item" onClick={() => nav('league', { id: l.id })}>
            <Flag country={l.country} size={21} />
            <span className="nm">{l.name}</span>
            {S.matches.some(m => m.league === l.id && m.status === 'live') && <span className="live-mini" />}
          </button>
        ))}
      </div>

      <div className="rl-section">
        <div className="rl-head"><span className="flame"><I.globe s={15} /></span> {t.countries}</div>
        {Object.entries(byCountry).map(([country, ls]) => {
          const isOpen = open[country] ?? (country === 'Türkiye');
          return (
            <React.Fragment key={country}>
              <button className="rl-item" onClick={() => setOpen(o => ({ ...o, [country]: !isOpen }))}>
                <Flag country={country} size={21} />
                <span className="nm">{country}</span>
                <span className="badge-n">{ls.length}</span>
                <span className={'chev' + (isOpen ? ' open' : '')}><I.chevR s={14} /></span>
              </button>
              {isOpen && (
                <div className="rl-sub">
                  {ls.map(l => (
                    <button key={l.id} className="rl-item" onClick={() => nav('league', { id: l.id })}>
                      <span className="nm">{l.name}</span>
                      {S.matches.some(m => m.league === l.id && m.status === 'live') && <span className="live-mini" />}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="promo">
        <h4>{t.appPromo}</h4>
        <p>{t.appText}</p>
        <div className="stores">
          <button><I.apple s={15} /> iOS</button>
          <button><I.android s={15} /> Android</button>
        </div>
      </div>
    </aside>
  );
}

/* alev/chevron motifi (marka V'sinden) */
function Flame({ s = 14 }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" style={{ display: 'block' }}><path d="M5 3h9l6 9-6 9H5l5.5-9z" /></svg>;
}

/* ════════════════ MAÇ SATIRI (paylaşılan) ════════════════ */
function ScoreCell({ m }) {
  if (m.status === 'upcoming') return <span className="mr-vs">—</span>;
  const homeLost = m.winner === 'away', awayLost = m.winner === 'home';
  return (
    <div className="mr-score tnum">
      <b className={homeLost ? 'lose' : ''}>{m.home.score}</b>
      <i>:</i>
      <b className={awayLost ? 'lose' : ''}>{m.away.score}</b>
    </div>
  );
}

function MatchRow({ m, ctx }) {
  const { nav, favs, toggleFav, t, pulse } = ctx;
  const fav = favs.has(m.id);
  const sub = m.sets ? m.sets.map(s => `${s[0]}-${s[1]}`).join('  ')
    : m.phase === 'et' ? (m.ft90 && `90' ${m.ft90[0]}-${m.ft90[1]}`)
    : m.ht ? `İY ${m.ht[0]}-${m.ht[1]}` : null;
  return (
    <div className={'mrow' + (m.status === 'live' ? ' live' : '')} onClick={() => nav('match', { id: m.id })}>
      <div className="mr-status">
        {m.status === 'live' ? <LiveTag m={m} pulse={pulse} />
          : m.status === 'upcoming' ? <span className="mr-time tnum">{m.clock}</span>
          : <span className="mr-fin">{m.clock}</span>}
        {sub && m.status !== 'upcoming' && <span className="mr-half">{sub}</span>}
      </div>
      <div className={'mr-team home' + (m.winner === 'away' ? ' lost' : '')}>
        <span className="nm">{m.home.name}</span>
        <Badge t={m.home} size={26} />
      </div>
      <ScoreCell m={m} />
      <div className={'mr-team away' + (m.winner === 'home' ? ' lost' : '')}>
        <Badge t={m.away} size={26} />
        <span className="nm">{m.away.name}</span>
      </div>
      <div className="mr-end">
        <PhasePill m={m} />
        {m.stream && <button className="watch-btn" onClick={e => { e.stopPropagation(); }}><I.play s={12} /> {t.watch}</button>}
        <button className={'iconbtn fav' + (fav ? ' on' : '')} onClick={e => { e.stopPropagation(); toggleFav(m.id); }}>
          <I.star s={17} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}

/* ════════════════ LİG BLOĞU (paylaşılan) ════════════════ */
function LeagueBlock({ league, matches, ctx, defaultOpen = true }) {
  const { nav, t } = ctx;
  const [open, setOpen] = React.useState(defaultOpen);
  const liveN = matches.filter(m => m.status === 'live').length;
  return (
    <div className="league-block">
      <div className="league-head">
        <Flag country={league.country} size={24} />
        <div className="lh-id">
          <span className="lh-name" onClick={() => nav('league', { id: league.id })}>{league.name}</span>
          <span className="lh-sub">{league.country}{league.round ? ' · ' + league.round : ''}</span>
        </div>
        <div className="lh-actions">
          {liveN > 0 && <span className="mr-live" style={{ fontSize: 13 }}><span className="live-dot pulse" /> {liveN}</span>}
          <button className="lh-link" onClick={() => nav('league', { id: league.id })}>{t.standings} <I.chevR s={13} /></button>
          <button className="lh-toggle" onClick={() => setOpen(o => !o)}><span className={'chev' + (open ? ' open' : '')}><I.chevR s={16} /></span></button>
        </div>
      </div>
      {open && matches.map(m => <MatchRow key={m.id} m={m} ctx={ctx} />)}
    </div>
  );
}

/* ════════════════ FOOTER ════════════════ */
function Footer({ ctx }) {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="logo"><Logo h={20} /></div>
        <div className="foot-links">
          <a>Hakkımızda</a><a>İletişim</a><a>Gizlilik</a><a>Kullanım Şartları</a><a>Reklam</a>
        </div>
        <span className="foot-copy">© 2026 ScoresTV — Demo tasarım</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Header, Subnav, LeftRail, MatchRow, LeagueBlock, ScoreCell, Footer, Flame });
