/* ScoresTV WEB — Ana sayfa (canlı skorlar) + sağ rail */

/* ── Tarih şeridi ── */
function DateStrip({ ctx }) {
  const { t, date, setDate } = ctx;
  const days = [];
  const today = new Date(2026, 5, 4); // 4 Haz 2026 (demo "bugün")
  for (let i = -3; i <= 7; i++) { const d = new Date(today); d.setDate(today.getDate() + i); days.push({ i, d }); }
  const wd = (d) => (ctx.lang === 'tr' ? ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[d.getDay()];
  const ref = React.useRef(null);
  return (
    <div className="date-strip">
      <button className="date-arrow" onClick={() => ref.current.scrollBy({ left: -180, behavior: 'smooth' })}><I.chevL s={16} /></button>
      <div className="date-days scroll-x" ref={ref}>
        {days.map(({ i, d }) => (
          <button key={i} className={'date-day' + (i === 0 ? ' today' : '') + (date === i ? ' on' : '')} onClick={() => setDate(i)}>
            <span className="wd">{i === 0 ? t.today : wd(d)}</span>
            <span className="dn tnum">{d.getDate()}</span>
          </button>
        ))}
      </div>
      <button className="date-arrow" onClick={() => ref.current.scrollBy({ left: 180, behavior: 'smooth' })}><I.chevR s={16} /></button>
    </div>
  );
}

/* ── Ana sayfa ── */
function Home({ ctx }) {
  const { t, sport, status, setStatus } = ctx;
  const S = window.SCORES;
  const sportMatches = S.matches.filter(m => S.leagues[m.league].sport === sport);
  const counts = {
    all: sportMatches.length,
    live: sportMatches.filter(m => m.status === 'live').length,
    upcoming: sportMatches.filter(m => m.status === 'upcoming').length,
    finished: sportMatches.filter(m => m.status === 'finished').length,
  };
  const filtered = status === 'all' ? sportMatches : sportMatches.filter(m => m.status === status);

  // lig lig grupla, lig sırasını koru
  const order = Object.keys(S.leagues).filter(id => S.leagues[id].sport === sport);
  const groups = order.map(id => ({ league: S.leagues[id], matches: filtered.filter(m => m.league === id) })).filter(g => g.matches.length);

  const chips = [
    { id: 'all', label: t.all, n: counts.all },
    { id: 'live', label: t.live, n: counts.live, live: true },
    { id: 'upcoming', label: t.upcoming, n: counts.upcoming },
    { id: 'finished', label: t.finished, n: counts.finished },
  ];

  return (
    <div className="main-col">
      <div className="toolbar">
        <DateStrip ctx={ctx} />
        <button className="cal-btn"><I.calendar s={16} /> Takvim</button>
      </div>
      <div className="chips">
        {chips.map(c => (
          <button key={c.id} className={'chip' + (status === c.id ? ' on' : '')} onClick={() => setStatus(c.id)}>
            {c.live && c.n > 0 && <span className="dot" />}
            {c.label}
            <span className={'cn' + (c.live && c.n > 0 ? ' live' : '')}>{c.n}</span>
          </button>
        ))}
      </div>
      {groups.length === 0
        ? <div className="card empty"><I.ball s={40} /><p>{t.noMatch}</p></div>
        : groups.map(g => <LeagueBlock key={g.league.id} league={g.league} matches={g.matches} ctx={ctx} />)}
    </div>
  );
}

/* ════════════════ SAĞ RAIL ════════════════ */
function RightRail({ ctx }) {
  const { t, nav, pulse } = ctx;
  const S = window.SCORES;
  const feat = S.matches.find(m => m.id === 'm1');
  const standings = S.standings.superlig.slice(0, 6);
  const news = S.news.slice(0, 4);
  const zoneFor = (i) => i < 2 ? 'ucl' : i < 3 ? 'uel' : i >= 7 ? 'rel' : '';

  return (
    <aside className="rail-right">
      {/* öne çıkan maç */}
      <div className="feat">
        <div className="feat-top">
          <span className="flame"><Flame /></span><span>{t.featured}</span>
          <span className="lv"><span className={'live-dot' + (pulse ? ' pulse' : '')} /> {feat.clock}</span>
        </div>
        <div className="feat-rows" style={{ cursor: 'pointer' }} onClick={() => nav('match', { id: feat.id })}>
          {['home', 'away'].map(side => {
            const tm = feat[side];
            const lead = feat.home.score !== feat.away.score && ((side === 'home') === (feat.home.score > feat.away.score));
            return (
              <div className={'feat-line' + (lead ? ' lead' : '')} key={side}>
                <Badge t={tm} size={30} />
                <span className="fl-nm">{tm.name}</span>
                {lead && <span className="fl-arrow"><I.play s={9} /></span>}
                <b className="fl-sc tnum">{tm.score}</b>
              </div>
            );
          })}
        </div>
        <div className="feat-sub">{S.leagues[feat.league].name} · {S.leagues[feat.league].round || '35. Hafta'}</div>
        <div className="feat-foot">
          <button className="watch-btn" style={{ flex: 1, justifyContent: 'center', padding: '11px' }}><I.play s={13} /> {t.watch}</button>
          <button className="watch-btn ghost" style={{ justifyContent: 'center', padding: '11px 14px' }} onClick={() => nav('match', { id: feat.id })}>{t.summary}</button>
        </div>
      </div>

      {/* gündem / X akışı */}
      <TwitterFeed ctx={ctx} />

      {/* haberler */}
      <div className="card">
        <div className="card-head"><span className="flame"><I.news s={15} /></span><h3>{t.topNews}</h3><button className="more" onClick={() => nav('news')}>Tümü <I.chevR s={12} /></button></div>
        {news.map(n => (
          <div className="news-item" key={n.id} onClick={() => nav('news')}>
            <div className="nthumb"><Thumb seed={n.id} label={n.tag} /></div>
            <div className="nbody"><h4>{n.title}</h4><span className="ntime">{n.cat} · {n.time}</span></div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function VerifiedMark({ s = 14 }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true">
      <path fill="currentColor" d="M12 1.5l2.4 1.9 3-.3 1 2.9 2.7 1.4-.8 3 .8 3-2.7 1.4-1 2.9-3-.3L12 22.5l-2.4-1.9-3 .3-1-2.9L2.9 16.6l.8-3-.8-3L5.6 9l1-2.9 3 .3z" />
      <path d="M8.2 12.2l2.5 2.5 5.1-5.4" fill="none" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TwitterFeed({ ctx }) {
  const { lang } = ctx;
  const S = window.SCORES;
  const tweets = S.tweets || [];
  return (
    <div className="card">
      <div className="card-head">
        <span className="tw-logo"><I.x s={13} /></span>
        <h3>{lang === 'tr' ? 'Gündem' : 'Trending'}</h3>
        <button className="more tw-follow">{lang === 'tr' ? 'Takip Et' : 'Follow'}</button>
      </div>
      {tweets.map((tw, i) => (
        <div className="tweet" key={i}>
          <span className="tw-av" style={{ background: tw.color }}>{tw.name.charAt(0)}</span>
          <div className="tw-body">
            <div className="tw-head">
              <span className="tw-name">{tw.name}</span>
              {tw.verified && <span className="tw-verified"><VerifiedMark s={14} /></span>}
              <span className="tw-handle">{tw.handle}</span>
              <span className="tw-dot">·</span>
              <span className="tw-time">{tw.time}</span>
            </div>
            <p className="tw-text">{tw.text}</p>
            <div className="tw-actions">
              <span className="tw-act"><I.reply s={14} /> {tw.reps}</span>
              <span className="tw-act"><I.retweet s={14} /> {tw.rts}</span>
              <span className="tw-act"><I.heart s={14} /> {tw.likes}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Home, RightRail, DateStrip, TwitterFeed });
