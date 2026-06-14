/* ScoresTV WEB — Maç Detay */

function MatchHero({ m, ctx }) {
  const { t, nav, favs, toggleFav, pulse } = ctx;
  const S = window.SCORES;
  const lg = S.leagues[m.league];
  const fav = favs.has(m.id);
  const up = m.status === 'upcoming';
  return (
    <div className="mh">
      <div className="mh-strip">
        <button className="mh-back" onClick={() => nav('home')}><I.chevL s={17} /></button>
        <Flag country={lg.country} size={20} />
        <span className="mh-league" onClick={() => nav('league', { id: lg.id })}>{lg.name}</span>
        <span className="mh-round">{lg.round}</span>
        <div style={{ flex: 1 }} />
        <button className={'iconbtn fav' + (fav ? ' on' : '')} onClick={() => toggleFav(m.id)}><I.star s={18} fill={fav ? 'currentColor' : 'none'} /></button>
        <button className="iconbtn"><I.share s={16} /></button>
      </div>
      <div className="mh-main">
        <button className="mh-team" onClick={() => nav('team', { short: m.home.short })}>
          <Badge t={m.home} size={68} />
          <span>{m.home.name}</span>
        </button>
        <div className="mh-center">
          <div className="mh-status">
            {m.status === 'live' ? <span className="mr-live" style={{ fontSize: 15 }}><span className={'live-dot' + (pulse ? ' pulse' : '')} /> {m.clock}</span>
              : up ? <span className="mh-time">{m.clock}</span>
              : <span className="mh-fin">{m.clock}</span>}
          </div>
          {up ? <div className="mh-vs">VS</div>
            : <div className="mh-score tnum"><b className={m.winner === 'away' ? 'lose' : ''}>{m.home.score}</b><i>:</i><b className={m.winner === 'home' ? 'lose' : ''}>{m.away.score}</b></div>}
          {m.ht && !up && <div className="mh-sub">İY {m.ht[0]}-{m.ht[1]}{m.ft90 ? ` · 90' ${m.ft90[0]}-${m.ft90[1]}` : ''}</div>}
          {m.sets && <div className="mh-sub">{m.sets.map(s => `${s[0]}-${s[1]}`).join('  ')}</div>}
          <PhasePill m={m} />
        </div>
        <button className="mh-team" onClick={() => nav('team', { short: m.away.short })}>
          <Badge t={m.away} size={68} />
          <span>{m.away.name}</span>
        </button>
      </div>
      {m.stream && <div className="mh-watch"><button className="watch-btn" style={{ padding: '12px 26px', fontSize: 15 }}><I.play s={14} /> {t.watch} · {lg.name}</button></div>}
    </div>
  );
}

/* ── Zaman çizelgesi ── */
function EvIcon({ e }) {
  if (e.type === 'goal') {
    if (e.goal === 'miss') return <span className="ev-ico miss"><span className="ev-ball" /></span>;
    return <span className={'ev-ico' + (e.goal === 'own' ? ' own' : '')}><span className="ev-ball" />{e.goal === 'pen' && <i className="ev-tag">P</i>}{e.goal === 'own' && <i className="ev-tag">KK</i>}</span>;
  }
  if (e.type === 'card') return <span className={'ev-card ' + e.card} />;
  if (e.type === 'sub') return <I.share s={15} />;
  if (e.type === 'var') return <span className="ev-var"><I.tv s={16} /></span>;
  return null;
}
function evLabel(e) {
  if (e.type === 'goal') return e.player;
  if (e.type === 'card') return e.player;
  if (e.type === 'sub') return e.inP;
  if (e.type === 'var') return 'VAR';
  return '';
}
function evSubLabel(e) {
  if (e.type === 'goal') return e.assist ? 'asist: ' + e.assist : (e.note || (e.goal === 'pen' ? 'Penaltı' : e.goal === 'own' ? 'Kendi kalesine' : 'Gol'));
  if (e.type === 'card') return e.card === 'red' ? 'Kırmızı kart' : 'Sarı kart';
  if (e.type === 'sub') return '↓ ' + e.outP;
  if (e.type === 'var') return e.note;
  return '';
}
function Timeline({ detail }) {
  if (!detail || !detail.events) return <div className="card empty"><p>Olay verisi yok</p></div>;
  const halves = { 1: '1. Yarı', 2: '2. Yarı', et: 'Uzatma', pen: 'Penaltılar' };
  const order = ['1', '2', 'et', 'pen'];
  const groups = order.map(h => ({ h, evs: detail.events.filter(e => String(e.half) === h) })).filter(g => g.evs.length);
  return (
    <div className="card tl-card">
      {groups.map(g => (
        <div key={g.h} className="tl-group">
          <div className="tl-period"><span>{halves[g.h]}</span></div>
          {g.evs.map((e, i) => (
            <div className="ev-row" key={i}>
              <div className={'ev-side ' + (e.side === 'home' ? 'left' : 'hide')}>
                {e.side === 'home' && <div className="ev-txt"><b>{evLabel(e)} <EvIcon e={e} /></b><span>{evSubLabel(e)}</span></div>}
              </div>
              <div className="ev-center"><span className="ev-min tnum">{e.min}'</span>{e.type === 'goal' && e.score && <i className="ev-score tnum">{e.score}</i>}</div>
              <div className={'ev-side right ' + (e.side === 'away' ? '' : 'hide')}>
                {e.side === 'away' && <div className="ev-txt"><b><EvIcon e={e} /> {evLabel(e)}</b><span>{evSubLabel(e)}</span></div>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── İstatistik barları ── */
function StatsBars({ detail, m }) {
  if (!detail || !detail.stats) return <div className="card empty"><p>İstatistik verisi yok</p></div>;
  return (
    <div className="card stats-card">
      <div className="stats-head">
        <span style={{ color: m.home.color }}>{m.home.short}</span>
        <span className="muted">İstatistik</span>
        <span style={{ color: m.away.color }}>{m.away.short}</span>
      </div>
      {detail.stats.map((s, i) => {
        const tot = s.home + s.away || 1;
        const hp = Math.round((s.home / tot) * 100), ap = 100 - hp;
        return (
          <div className="stat-block" key={i}>
            <div className="stat-top"><b className="tnum">{s.home}{s.pct ? '%' : ''}</b><span>{s.label}</span><b className="tnum">{s.away}{s.pct ? '%' : ''}</b></div>
            <div className="stat-bar"><span className="sh" style={{ width: hp + '%' }} /><span className="sa" style={{ width: ap + '%' }} /></div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Diziliş / Saha ── */
function ratingCls(r) { return r >= 7.5 ? 'hi' : r >= 6.8 ? 'mid' : 'lo'; }
function Pitch({ data, color }) {
  const lines = data.lines;
  return (
    <div className="pitch">
      <div className="pitch-lines" />
      {lines.map((line, li) => {
        const y = ((li + 0.5) / lines.length) * 100;
        return line.map((p, pi) => {
          const x = ((pi + 0.5) / line.length) * 100;
          return (
            <div className="pp" key={li + '-' + pi} style={{ left: x + '%', top: y + '%' }}>
              <div className="pp-shirt" style={{ background: color }}>{p.no}{p.cap && <i className="pp-cap">C</i>}{p.r && <i className={'pp-rating ' + ratingCls(p.r)}>{p.r.toFixed(1)}</i>}</div>
              <span className="pp-name">{p.n}</span>
            </div>
          );
        });
      })}
    </div>
  );
}
function Lineups({ detail, m }) {
  const [side, setSide] = React.useState('home');
  if (!detail || !detail.lineups) return <div className="card empty"><p>Diziliş açıklanmadı</p></div>;
  const lu = detail.lineups[side];
  const team = m[side];
  return (
    <div className="lineup-wrap">
      <div className="lu-switch">
        <button className={side === 'home' ? 'on' : ''} onClick={() => setSide('home')}><Badge t={m.home} size={20} /> {m.home.name} <em>{detail.lineups.home.formation}</em></button>
        <button className={side === 'away' ? 'on' : ''} onClick={() => setSide('away')}><Badge t={m.away} size={20} /> {m.away.name} <em>{detail.lineups.away.formation}</em></button>
      </div>
      <Pitch data={lu} color={team.color} />
      <div className="subs-label">Yedekler</div>
      <div className="card subs-card">
        {lu.subs.map((p, i) => (
          <div className="sub-row" key={i}>
            <span className="sub-no tnum">{p.no}</span>
            <span className="sub-name">{p.n}</span>
            {p.on && <span className="sub-on">↑ {p.on}'</span>}
            <span className="sub-pos">{p.pos}</span>
            {p.r && <span className={'sub-rating ' + ratingCls(p.r)}>{p.r.toFixed(1)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── H2H ── */
function H2H({ detail, m }) {
  if (!detail || !detail.h2h) return <div className="card empty"><p>Karşılaşma verisi yok</p></div>;
  let hw = 0, d = 0, aw = 0;
  detail.h2h.forEach(g => { const hs = g.h === m.home.short ? g.hs : g.as, as = g.h === m.home.short ? g.as : g.hs; if (hs > as) hw++; else if (hs < as) aw++; else d++; });
  const tot = detail.h2h.length || 1;
  return (
    <div className="h2h-wrap">
      <div className="card h2h-sum">
        <div className="h2h-tot">SON {tot} KARŞILAŞMA</div>
        <div className="h2h-wdl">
          <div className="wdl-col"><span className="wdl-n tnum" style={{ color: m.home.color }}>{hw}</span><span className="wdl-l">{m.home.name}</span></div>
          <div className="wdl-col"><span className="wdl-n tnum">{d}</span><span className="wdl-l">Berabere</span></div>
          <div className="wdl-col"><span className="wdl-n tnum" style={{ color: m.away.color }}>{aw}</span><span className="wdl-l">{m.away.name}</span></div>
        </div>
        <div className="h2h-bar"><span style={{ flex: hw, background: m.home.color }} /><span style={{ flex: d, background: 'var(--text-faint)' }} /><span style={{ flex: aw, background: m.away.color }} /></div>
      </div>
      <div className="card h2h-list">
        {detail.h2h.map((g, i) => {
          const homeWin = g.hs > g.as, awayWin = g.hs < g.as;
          return (
            <div className="h2h-row" key={i}>
              <div className="h2h-meta"><span className="h2h-date">{g.date}</span><span className="h2h-comp">{g.comp}</span></div>
              <div className="h2h-match">
                <span className={'h2h-tm home ' + (homeWin ? 'win' : 'lose')}>{g.h}</span>
                <span className="h2h-sc tnum"><b>{g.hs}</b><i>-</i><b>{g.as}</b>{g.penH != null && <i className="h2h-pen">({g.penH}-{g.penA})</i>}</span>
                <span className={'h2h-tm away ' + (awayWin ? 'win' : 'lose')}>{g.a}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tahmin ── */
function Prediction({ detail, ctx }) {
  const { t } = ctx;
  const [vote, setVote] = React.useState(null);
  if (!detail || !detail.predict) return null;
  const p = detail.predict;
  const opts = [{ k: 'h', label: '1', pct: p.h }, { k: 'd', label: 'X', pct: p.d }, { k: 'a', label: '2', pct: p.a }];
  return (
    <div className="card predict-card">
      <div className="predict-q">{t.whoWins}</div>
      <div className="predict-bars">
        {opts.map(o => (
          <button key={o.k} className={'predict-bar' + (vote === o.k ? ' mine' : '')} onClick={() => setVote(o.k)}>
            <div className="pb-row"><span className="pb-tag">{o.label}</span><span className="pb-pct tnum">{o.pct}%</span></div>
            <div className="pb-track"><span className="pb-fill" style={{ width: o.pct + '%', background: vote === o.k ? 'var(--accent)' : 'var(--text-faint)' }} /></div>
          </button>
        ))}
      </div>
      <div className="predict-votes">{p.votes.toLocaleString('tr')} {t.votes}{vote ? ' · oyun kaydedildi' : ''}</div>
    </div>
  );
}

/* ── Maç bilgisi ── */
function MatchInfo({ detail, ctx }) {
  const { t } = ctx;
  if (!detail || !detail.info) return null;
  const inf = detail.info;
  const rows = [
    { ic: I.calendar, k: t.date, v: inf.date },
    { ic: I.clock, k: 'Saat', v: inf.time },
    { ic: I.whistle, k: t.ref, v: inf.referee },
    { ic: I.pin, k: t.stadium, v: inf.stadium },
    { ic: I.tv, k: t.channel, v: inf.channel },
  ];
  return (
    <div className="card info-card">
      <div className="card-head"><h3>Maç Bilgisi</h3></div>
      {rows.map((r, i) => (
        <div className="info-row" key={i}><span className="info-ic"><r.ic s={16} /></span><span className="info-k">{r.k}</span><span className="info-v">{r.v}</span></div>
      ))}
    </div>
  );
}

/* ── Sayfa ── */
function MatchPage({ ctx, id }) {
  const { t } = ctx;
  const S = window.SCORES;
  const m = S.matches.find(x => x.id === id);
  const detail = S.details[id];
  const [tab, setTab] = React.useState('summary');
  if (!m) return <div className="main-col"><div className="card empty"><p>Maç bulunamadı</p></div></div>;
  const isFootball = S.leagues[m.league].sport === 'futbol';
  const tabs = [
    { k: 'summary', label: t.summary },
    { k: 'stats', label: t.stats },
    ...(isFootball ? [{ k: 'lineups', label: t.lineups }] : []),
    { k: 'h2h', label: t.h2h },
  ];
  return (
    <div className="match-page">
      <MatchHero m={m} ctx={ctx} />
      <div className="seg-tabs">
        {tabs.map(tb => <button key={tb.k} className={'seg-tab' + (tab === tb.k ? ' on' : '')} onClick={() => setTab(tb.k)}>{tb.label}</button>)}
      </div>
      <div className="match-grid">
        <div className="match-main">
          {tab === 'summary' && <><Timeline detail={detail} /><Prediction detail={detail} ctx={ctx} /></>}
          {tab === 'stats' && <StatsBars detail={detail} m={m} />}
          {tab === 'lineups' && <Lineups detail={detail} m={m} />}
          {tab === 'h2h' && <H2H detail={detail} m={m} />}
        </div>
        <div className="match-side">
          <MatchInfo detail={detail} ctx={ctx} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MatchPage, MatchHero, Timeline, StatsBars, Lineups, H2H, Prediction, MatchInfo });
