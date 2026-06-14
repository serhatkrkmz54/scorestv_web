/* ScoresTV WEB — Lig / Takım / Oyuncu / Haber sayfaları */

/* ════════════════ LİG SAYFASI ════════════════ */
function StandingsTable({ rows, ctx, leagueId }) {
  const { t, nav } = ctx;
  const zoneFor = (i) => i < 2 ? 'ucl' : i < 3 ? 'uel' : i >= rows.length - 1 ? 'rel' : '';
  return (
    <div className="card table-card">
      <div className="tbl-head">
        <span className="c-pos">#</span><span className="c-team">{ctx.lang === 'tr' ? 'Takım' : 'Team'}</span>
        <span className="c-n">{t.played}</span><span className="c-n">{t.won}</span><span className="c-n">{t.drawn}</span><span className="c-n">{t.lost}</span>
        <span className="c-n">{t.goalDiff}</span><span className="c-form">Form</span><span className="c-p">{t.points}</span>
      </div>
      {rows.map((s, i) => (
        <div className="tbl-row" key={i} onClick={() => nav('team', { short: s.t.short })}>
          <span className="c-pos"><span className={'zone ' + zoneFor(i)} />{i + 1}</span>
          <span className="c-team"><Badge t={s.t} size={24} /><b>{s.t.name}</b></span>
          <span className="c-n tnum">{s.o}</span><span className="c-n tnum">{s.g}</span><span className="c-n tnum">{s.b}</span><span className="c-n tnum">{s.m}</span>
          <span className="c-n c-av tnum">{s.av}</span>
          <span className="c-form">{s.form.map((f, j) => <i key={j} className={'fm ' + f}>{f}</i>)}</span>
          <span className="c-p tnum">{s.p}</span>
        </div>
      ))}
      <div className="legend">
        <span><i className="zone ucl" /> Şampiyonlar Ligi</span>
        <span><i className="zone uel" /> Avrupa Ligi</span>
        <span><i className="zone rel" /> Küme düşme</span>
      </div>
    </div>
  );
}

function ScorerList({ rows, ctx }) {
  const { t } = ctx;
  return (
    <div className="card scorer-card">
      {rows.map((s, i) => (
        <div className="scorer-row" key={i}>
          <span className="sc-rank tnum">{i + 1}</span>
          <Badge t={s.t} size={28} />
          <div className="sc-id"><span className="sc-name">{s.p}</span><span className="sc-team">{s.t.name}</span></div>
          <div className="sc-nums"><span className="sc-goals tnum">{s.g}</span><span className="sc-assist tnum">{s.a} <i>{t.assists}</i></span></div>
        </div>
      ))}
    </div>
  );
}

function LeaguePage({ ctx, id }) {
  const { t, nav } = ctx;
  const S = window.SCORES;
  const lg = S.leagues[id];
  const [tab, setTab] = React.useState('table');
  if (!lg) return <div className="main-col"><div className="card empty"><p>Lig bulunamadı</p></div></div>;
  const matches = S.matches.filter(m => m.league === id);
  const liveN = matches.filter(m => m.status === 'live').length;
  const standings = S.standings[id];
  const scorers = S.scorers[id];
  const tabs = [
    { k: 'table', label: t.standings },
    { k: 'fixtures', label: t.fixtures },
    ...(scorers ? [{ k: 'scorers', label: t.scorers }] : []),
  ];
  return (
    <div className="main-col">
      <div className="lg-hero" style={{ '--lc': lg.color }}>
        <div className="lg-emblem"><Flag country={lg.country} size={34} /></div>
        <div className="lg-hero-id">
          <div className="lg-hero-name">{lg.name}</div>
          <div className="lg-hero-sub">{lg.country} · {lg.round}</div>
        </div>
        <div className="lg-hero-stat"><span className="lhs-v tnum">{liveN}</span><span className="lhs-k">{t.live}</span></div>
      </div>
      <div className="seg-tabs">
        {tabs.map(tb => <button key={tb.k} className={'seg-tab' + (tab === tb.k ? ' on' : '')} onClick={() => setTab(tb.k)}>{tb.label}</button>)}
      </div>
      {tab === 'table' && (standings ? <StandingsTable rows={standings} ctx={ctx} leagueId={id} /> : <div className="card empty"><I.trophy s={38} /><p>Puan durumu bu lig için demoda yok</p></div>)}
      {tab === 'fixtures' && <LeagueBlock league={lg} matches={matches} ctx={ctx} />}
      {tab === 'scorers' && scorers && <ScorerList rows={scorers} ctx={ctx} />}
    </div>
  );
}

/* ════════════════ TAKIM SAYFASI ════════════════ */
function FormDots({ form }) {
  return <span className="form-dots">{form.map((f, i) => <i key={i} className={'fm ' + f}>{f}</i>)}</span>;
}
const POS_META = {
  Kaleci:   { ic: I.gloves, role: 'GK',  en: 'Goalkeepers' },
  Defans:   { ic: I.shield, role: 'DEF', en: 'Defenders' },
  Ortasaha: { ic: I.ball,   role: 'MID', en: 'Midfielders' },
  Forvet:   { ic: I.boot,   role: 'FWD', en: 'Forwards' },
};
function Jersey({ color, no }) {
  return (
    <span className="sq-jersey">
      <svg viewBox="0 0 64 60" width="62" height="58" aria-hidden="true">
        <path d="M20 4 L26 4 L32 10 L38 4 L44 4 L62 12 L54 25.5 L48 21 L48 56 L16 56 L16 21 L10 25.5 L2 12 Z" fill={color} stroke="rgba(0,0,0,.14)" strokeWidth="1" strokeLinejoin="round" />
        <path d="M26 4 L32 10 L38 4 Z" fill="rgba(255,255,255,.9)" />
        <path d="M20 4 L26 4 L32 10 L38 4 L44 4 L48 7 L48 11 L16 11 L16 7 Z" fill="rgba(255,255,255,.12)" />
      </svg>
      <span className="sq-jno tnum">{no}</span>
    </span>
  );
}
function TeamPage({ ctx, short }) {
  const { t, nav } = ctx;
  const S = window.SCORES;
  const tp = S.teamProfiles[short];
  const [tab, setTab] = React.useState('overview');
  if (!tp) {
    // profil yoksa basit fallback (puan tablosundan bul)
    let found;
    Object.values(S.standings).forEach(rows => { const r = rows.find(x => x.t.short === short); if (r) found = r; });
    return (
      <div className="main-col">
        <div className="card empty" style={{ padding: '40px 20px' }}>
          {found ? <Badge t={found.t} size={56} /> : <I.shirt s={38} />}
          <p style={{ marginTop: 14 }}>{found ? found.t.name : short} — detaylı profil demoda yalnızca Galatasaray için hazır.</p>
          <button className="watch-btn ghost" style={{ marginTop: 14 }} onClick={() => nav('team', { short: 'GS' })}>Galatasaray profilini gör</button>
        </div>
      </div>
    );
  }
  const tabs = [{ k: 'overview', label: t.overview }, { k: 'squad', label: t.squad }, { k: 'fixtures', label: t.fixtures }];
  const tColor = tp.color;
  const [following, setFollowing] = React.useState(false);
  return (
    <div className="main-col">
      <div className="tm-hero" style={{ '--tc': tColor }}>
        <Badge t={tp} size={72} />
        <div className="tm-hero-id">
          <div className="tm-hero-name">{tp.name}</div>
          <div className="tm-hero-sub">{tp.country} · {tp.stadium} · {tp.city}</div>
          <FormDots form={tp.form} />
        </div>
        <div className="tm-hero-end">
          <button className={'follow-btn' + (following ? ' on' : '')} onClick={() => setFollowing(f => !f)}>
            <I.star s={16} fill={following ? 'currentColor' : 'none'} /> {following ? (ctx.lang === 'tr' ? 'Takip Ediliyor' : 'Following') : (ctx.lang === 'tr' ? 'Takip Et' : 'Follow')}
          </button>
          <div className="tm-hero-pos"><span className="thp-v tnum">{tp.pos}.</span><span className="thp-k">{t.position}</span></div>
        </div>
      </div>
      {tp.stats && (
        <div className="tm-stats">
          {[
            { v: tp.stats.gf, k: ctx.lang === 'tr' ? 'Atılan' : 'Goals For', ic: I.ball },
            { v: tp.stats.ga, k: ctx.lang === 'tr' ? 'Yenilen' : 'Goals Against', ic: I.net },
            { v: tp.stats.cs, k: ctx.lang === 'tr' ? 'Gól Yemeden' : 'Clean Sheets', ic: I.gloves },
            { v: tp.stats.sh.toFixed(1), k: ctx.lang === 'tr' ? 'Maç Başı Gol' : 'Goals / Game', ic: I.chart },
          ].map((c, i) => (
            <div className="ts-cell" key={i} style={{ '--tc': tColor }}>
              <span className="ts-bg" aria-hidden="true"><c.ic s={64} /></span>
              <span className="ts-v tnum">{c.v}</span>
              <span className="ts-k">{c.k}</span>
            </div>
          ))}
        </div>
      )}
      <div className="tm-facts">
        <div className="fact"><span className="fk">{t.coach}</span><span className="fv">{tp.coach}</span></div>
        <div className="fact"><span className="fk">{t.founded}</span><span className="fv tnum">{tp.founded}</span></div>
        <div className="fact"><span className="fk">{t.stadium}</span><span className="fv">{tp.stadium}</span></div>
        <div className="fact"><span className="fk">{t.city}</span><span className="fv">{tp.city}</span></div>
      </div>
      <div className="seg-tabs">
        {tabs.map(tb => <button key={tb.k} className={'seg-tab' + (tab === tb.k ? ' on' : '')} onClick={() => setTab(tb.k)}>{tb.label}</button>)}
      </div>
      {tab === 'overview' && (
        <div className="tm-two">
          <div className="card list-card">
            <div className="card-head"><h3>{t.recentMatches}</h3></div>
            {tp.recent.map((g, i) => (
              <div className="fx-row" key={i}>
                <span className={'fx-res ' + g.win}>{g.win === 'w' ? 'G' : g.win === 'd' ? 'B' : 'M'}</span>
                <span className="fx-comp">{g.comp}</span>
                <span className="fx-ha">{g.ha}</span>
                <span className="fx-opp"><Badge t={g.opp} size={20} /> {g.opp.name}</span>
                <span className="fx-score tnum">{g.res}</span>
              </div>
            ))}
          </div>
          <div className="card list-card">
            <div className="card-head"><h3>{t.nextMatches}</h3></div>
            {tp.next.map((g, i) => (
              <div className="fx-row" key={i}>
                <span className="fx-when">{g.when}</span>
                <span className="fx-comp">{g.comp}</span>
                <span className="fx-ha">{g.ha}</span>
                <span className="fx-opp"><Badge t={g.opp} size={20} /> {g.opp.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'squad' && (
        <div className="squad2">
          {Object.entries(tp.squad).map(([pos, players]) => {
            const meta = POS_META[pos] || { ic: I.shirt, en: pos };
            return (
              <div className="sq-group" key={pos}>
                <div className="sq-group-head">
                  <span className="sq-pos-ic" style={{ '--tc': tColor }}><meta.ic s={18} /></span>
                  <span className="sq-pos-name">{ctx.lang === 'tr' ? pos : meta.en}</span>
                  <span className="sq-count tnum">{players.length}</span>
                  <span className="sq-pos-role">{meta.role}</span>
                </div>
                <div className="sq-grid2">
                  {players.map((p, i) => {
                    const clickable = !!S.players[p.n];
                    return (
                      <button className={'sq-card' + (clickable ? ' link' : '')} key={i} style={{ '--tc': tColor }} onClick={() => clickable && nav('player', { name: p.n })}>
                        {p.cap && <span className="sq-cap" title="Kaptan">C</span>}
                        <Jersey color={tColor} no={p.no} />
                        <span className="sq-pname">{p.n}</span>
                        <span className="sq-nat2"><Flag country={p.nat} size={17} /> {p.nat}</span>
                        {clickable && <span className="sq-go"><I.chevR s={14} /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab === 'fixtures' && <TeamFixtures tp={tp} leagueId={tp.league} ctx={ctx} />}
    </div>
  );
}

/* ── Takım fikstürü (hafta hafta) ── */
function buildWeeks(tp, leagueId) {
  const S = window.SCORES;
  const pool = (S.standings[leagueId] || []).map(s => s.t).filter(t => t.short !== tp.short);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const wdays = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const times = ['16:00', '19:00', '21:45', '20:00'];
  const seed0 = tp.short.charCodeAt(0) + (tp.short.charCodeAt(1) || 7);
  const total = 34, current = 31;
  const weeks = [];
  let d = new Date(2025, 7, 16);
  for (let w = 1; w <= total; w++) {
    const opp = pool.length ? pool[(w * 3 + seed0) % pool.length] : { name: '—', short: '–', color: '#888' };
    const ha = w % 2 === 0 ? 'D' : 'E';
    const date = new Date(d); d.setDate(d.getDate() + 7);
    const played = w < current;
    const gf = (w * 5 + seed0) % 4;
    const ga = (w * 3 + seed0 * 2) % 3;
    const win = gf > ga ? 'w' : gf < ga ? 'l' : 'd';
    weeks.push({
      w, opp, ha, played, gf, ga, win,
      dateLabel: `${date.getDate()} ${months[date.getMonth()]}`,
      kickoff: `${wdays[date.getDay()]} ${times[w % times.length]}`,
      live: w === current,
    });
  }
  return { weeks, current };
}

function TeamFixtures({ tp, leagueId, ctx }) {
  const { lang } = ctx;
  const { weeks, current } = React.useMemo(() => buildWeeks(tp, leagueId), [tp, leagueId]);
  const [sel, setSel] = React.useState(current);
  const stripRef = React.useRef(null);
  const wk = weeks.find(x => x.w === sel) || weeks[0];

  React.useEffect(() => {
    const el = stripRef.current; if (!el) return;
    const on = el.querySelector('.wk-day.on');
    if (on) el.scrollLeft = on.offsetLeft - el.clientWidth / 2 + on.clientWidth / 2;
  }, [sel]);

  const home = wk.ha === 'D' ? tp : wk.opp;
  const away = wk.ha === 'D' ? wk.opp : tp;
  const hs = wk.ha === 'D' ? wk.gf : wk.ga;
  const as = wk.ha === 'D' ? wk.ga : wk.gf;
  const resTag = !wk.played ? { c: 'up', label: lang === 'tr' ? 'Yaklaşan' : 'Upcoming' }
    : wk.win === 'w' ? { c: 'w', label: lang === 'tr' ? 'Galibiyet' : 'Win' }
    : wk.win === 'l' ? { c: 'l', label: lang === 'tr' ? 'Mağlubiyet' : 'Loss' }
    : { c: 'd', label: lang === 'tr' ? 'Beraberlik' : 'Draw' };

  return (
    <div className="wk-fix">
      <div className="wk-strip-wrap">
        <button className="date-arrow" onClick={() => setSel(s => Math.max(1, s - 1))}><I.chevL s={16} /></button>
        <div className="wk-days scroll-x" ref={stripRef}>
          {weeks.map(x => (
            <button key={x.w} className={'wk-day' + (x.w === sel ? ' on' : '') + (x.w === current ? ' cur' : '')} onClick={() => setSel(x.w)}>
              <span className="wkd-l">{lang === 'tr' ? 'HAFTA' : 'WEEK'}</span>
              <span className="wkd-n tnum">{x.w}</span>
            </button>
          ))}
        </div>
        <button className="date-arrow" onClick={() => setSel(s => Math.min(weeks.length, s + 1))}><I.chevR s={16} /></button>
      </div>

      <div className="card wk-match">
        <div className="wk-head">
          <span className="wk-title">{lang === 'tr' ? 'Hafta' : 'Week'} {wk.w}</span>
          <span className="wk-date">{wk.live ? <span className="mr-live" style={{ fontSize: 13 }}><span className="live-dot pulse" /> CANLI</span> : wk.played ? wk.dateLabel : wk.kickoff}</span>
        </div>
        <div className="wk-body">
          <button className={'wk-team home' + (wk.played && hs < as ? ' lose' : '')} onClick={() => ctx.nav('team', { short: home.short })}>
            <span className="wk-nm">{home.name}</span>
            <Badge t={home} size={38} />
          </button>
          <div className="wk-score tnum">
            {wk.played
              ? <><b className={hs < as ? 'lose' : ''}>{hs}</b><i>:</i><b className={as < hs ? 'lose' : ''}>{as}</b></>
              : <i>VS</i>}
          </div>
          <button className={'wk-team away' + (wk.played && as < hs ? ' lose' : '')} onClick={() => ctx.nav('team', { short: away.short })}>
            <Badge t={away} size={38} />
            <span className="wk-nm">{away.name}</span>
          </button>
        </div>
        <div className="wk-foot">
          <span className={'wk-tag ' + resTag.c}>{resTag.label}</span>
          <span className="wk-venue"><I.pin s={13} /> {wk.ha === 'D' ? (lang === 'tr' ? 'İç Saha' : 'Home') : (lang === 'tr' ? 'Deplasman' : 'Away')} · {tp.stadium}</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════ OYUNCU SAYFASI ════════════════ */
function Radar({ data }) {
  const n = data.length, R = 86, cx = 110, cy = 110;
  const pt = (i, r) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const poly = data.map((d, i) => pt(i, (d.v / 100) * R).join(',')).join(' ');
  return (
    <svg viewBox="0 0 220 220" className="radar">
      {[0.25, 0.5, 0.75, 1].map((g, gi) => (
        <polygon key={gi} points={data.map((_, i) => pt(i, R * g).join(',')).join(' ')} fill="none" stroke="var(--border-2)" strokeWidth="1" />
      ))}
      {data.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />; })}
      <polygon points={poly} fill="color-mix(in srgb, var(--accent) 28%, transparent)" stroke="var(--accent)" strokeWidth="2" />
      {data.map((d, i) => { const [x, y] = pt(i, R + 16); return <text key={i} x={x} y={y} fontSize="11" fontWeight="700" fill="var(--text-dim)" textAnchor="middle" dominantBaseline="middle">{d.k}</text>; })}
    </svg>
  );
}
function PlayerPage({ ctx, name }) {
  const { t, nav } = ctx;
  const S = window.SCORES;
  const p = S.players[name];
  if (!p) return <div className="main-col"><div className="card empty"><I.user s={38} /><p>Oyuncu profili demoda yok</p></div></div>;
  const s = p.season;
  const stats = [
    { k: t.played, v: s.mp }, { k: t.goals, v: s.g }, { k: t.assists, v: s.a },
    { k: t.rating, v: s.rating.toFixed(1) }, { k: 'Dakika', v: s.min }, { k: 'Sarı/Kırmızı', v: s.yellow + '/' + s.red },
  ];
  return (
    <div className="main-col">
      <div className="pl-hero" style={{ '--tc': p.team.color }}>
        <div className="pl-shirt" style={{ background: p.team.color }}>{p.no}</div>
        <div className="pl-id">
          <div className="pl-name">{p.name}</div>
          <button className="pl-team" onClick={() => nav('team', { short: p.team.short })}><Badge t={p.team} size={20} /> {p.team.name} · {p.pos}</button>
        </div>
        <div className="pl-rating"><span className="plr-v tnum">{s.rating.toFixed(1)}</span><span className="plr-k">{t.rating}</span></div>
      </div>
      <div className="tm-facts">
        <div className="fact"><span className="fk">{t.nation}</span><span className="fv">{p.nat}</span></div>
        <div className="fact"><span className="fk">{t.age}</span><span className="fv tnum">{p.age}</span></div>
        <div className="fact"><span className="fk">{t.height}</span><span className="fv">{p.height}</span></div>
        <div className="fact"><span className="fk">{t.foot}</span><span className="fv">{p.foot}</span></div>
        <div className="fact"><span className="fk">{t.value}</span><span className="fv">{p.value}</span></div>
      </div>
      <div className="pl-two">
        <div className="card">
          <div className="card-head"><h3>{t.season} 25/26</h3></div>
          <div className="stat-grid">
            {stats.map((st, i) => <div className="stat-cell" key={i}><span className="sc-v tnum">{st.v}</span><span className="sc-k">{st.k}</span></div>)}
          </div>
        </div>
        <div className="card radar-card">
          <div className="card-head"><h3>Yetenek Profili</h3></div>
          <div className="radar-wrap"><Radar data={p.radar} /></div>
        </div>
      </div>
      <div className="card list-card">
        <div className="card-head"><h3>{t.recentMatches}</h3></div>
        {p.recent.map((g, i) => (
          <div className="fx-row" key={i}>
            <span className="fx-comp" style={{ width: 92 }}>{g.comp}</span>
            <span className="fx-opp" style={{ flex: 1 }}><Badge t={g.opp} size={20} /> {g.opp.name}</span>
            <span className="fx-score tnum">{g.res}</span>
            <span className="pl-ga tnum">{g.g}G {g.a}A</span>
            <span className={'sub-rating ' + ratingCls(g.r)}>{g.r.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════ HABERLER SAYFASI ════════════════ */
function NewsSlider({ slides, ctx }) {
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const n = slides.length;
  const go = (d) => setIdx(i => (i + d + n) % n);
  React.useEffect(() => {
    if (paused || n < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % n), 5000);
    return () => clearInterval(id);
  }, [paused, n]);
  return (
    <div className="news-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="ns-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {slides.map(s => (
          <div className="ns-slide" key={s.id}>
            <div className="ns-bg"><Thumb seed={s.id} label={s.tag} /></div>
            <div className="ns-scrim" />
            <div className="ns-overlay">
              <span className="ns-cat">{s.cat}</span>
              <h3 className="ns-title">{s.title}</h3>
              {s.summary && <p className="ns-sum">{s.summary}</p>}
              <span className="ns-time"><I.clock s={13} /> {s.time}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="ns-arrow left" onClick={() => go(-1)} aria-label="Önceki"><I.chevL s={20} /></button>
      <button className="ns-arrow right" onClick={() => go(1)} aria-label="Sonraki"><I.chevR s={20} /></button>
      <div className="ns-dots">
        {slides.map((_, i) => (
          <button key={i} className={'ns-dot' + (i === idx ? ' on' : '')} onClick={() => setIdx(i)} aria-label={'Slayt ' + (i + 1)} />
        ))}
      </div>
    </div>
  );
}

function NewsPage({ ctx }) {
  const { t } = ctx;
  const S = window.SCORES;
  const news = S.news;
  const slides = news.slice(0, 4);
  return (
    <div className="news-page">
      <div className="section-title" style={{ marginBottom: 6 }}><span className="flame"><Flame s={18} /></span><h2>{t.news}</h2></div>
      <NewsSlider slides={slides} ctx={ctx} />
      <div className="news-grid uniform">
        {news.map(n => (
          <div className="card news-card2" key={n.id}>
            <div className="nc-thumb"><Thumb seed={n.id} label={n.tag} /><span className="news-cat">{n.cat}</span></div>
            <div className="nc-body"><h3>{n.title}</h3><span className="ntime">{n.time}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LeaguePage, TeamPage, PlayerPage, NewsPage, StandingsTable, ScorerList, Radar, FormDots });
