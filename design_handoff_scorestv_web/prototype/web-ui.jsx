/* ScoresTV WEB — paylaşılan UI bileşenleri */

/* ───────── Logo (SVG, Rajdhani) ───────── */
function Logo({ h = 26 }) {
  // koyu/açık temada metin rengini currentColor'a bağlamak yerine token
  return (
    <svg viewBox="-6 14 648 126" height={h} style={{ width: 'auto', display: 'block' }} fontFamily="Rajdhani, sans-serif" aria-label="ScoresTV">
      <defs>
        <mask id="vcut-web">
          <polygon points="513,27 581,27 630,79.5 581,132 513,132" fill="#fff" />
          <text x="526" y="128" fontSize="134" fontWeight="700" fill="#000">V</text>
        </mask>
      </defs>
      <text x="0" y="132" fontSize="150" fontWeight="700" letterSpacing="-2" fill="var(--text)">ScoresT</text>
      <polygon points="513,27 581,27 630,79.5 581,132 513,132" fill="var(--accent)" mask="url(#vcut-web)" />
    </svg>
  );
}

/* ───────── İkonlar ───────── */
const I = {
  search: (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>),
  user:   (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>),
  star:   (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill={p.fill||'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.8 6.1 20.3l1.3-6.2L2.7 9.5l6.3-.7z"/></svg>),
  play:   (p={}) => (<svg viewBox="0 0 24 24" width={p.s||14} height={p.s||14} fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>),
  chevR:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>),
  chevL:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>),
  chevD:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l7 7 7-7"/></svg>),
  sun:    (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19"/></svg>),
  moon:   (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>),
  calendar:(p={}) => (<svg viewBox="0 0 24 24" width={p.s||17} height={p.s||17} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>),
  ball:   (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.4l3.4 2.5-1.3 4h-4.2l-1.3-4z" fill="currentColor" stroke="none"/><path d="M12 3.2v4.2M4.3 9.1l3.5 1M19.7 9.1l-3.5 1M7.6 19.4l1.9-3.4M16.4 19.4l-1.9-3.4" strokeWidth="1.5" strokeLinecap="round"/></svg>),
  basket: (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.7 5.7c2.9 2.6 2.9 10 0 12.6M18.3 5.7c-2.9 2.6-2.9 10 0 12.6"/></svg>),
  voley:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3c-3.1 3.4-3.1 11.6 0 18M4.2 7.7c4 1.2 11.4 1.2 15.6-3M4.2 16.3c4-1.2 11.4-1.2 15.6 3"/></svg>),
  tennis: (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M5.5 5.5C9 8 9 16 5.5 18.5M18.5 5.5C15 8 15 16 18.5 18.5"/></svg>),
  trophy: (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3"/><path d="M12 14v3M9 21h6M10 21c0-2 .5-3 2-3s2 1 2 3"/></svg>),
  globe:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>),
  bell:   (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 004 0"/></svg>),
  tv:     (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="6.5" width="19" height="13" rx="2.5"/><path d="M8 3l4 3.5L16 3"/></svg>),
  news:   (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"><path d="M4 4h12v16H5a2 2 0 01-2-2V6"/><path d="M16 8h3a1 1 0 011 1v9a2 2 0 01-2 2"/><path d="M7 8h6M7 12h6M7 16h4" strokeLinecap="round"/></svg>),
  share:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>),
  pin:    (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.7 7-11a7 7 0 10-14 0c0 5.3 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>),
  clock:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>),
  whistle:(p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="currentColor"><circle cx="9" cy="13" r="6"/><path d="M14 11h8v3l-7 1z"/></svg>),
  net:    (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="18" height="13" rx="1"/><path d="M3 10h18M3 14h18M7 6v13M11 6v13M15 6v13M19 10v9"/></svg>),
  gloves: (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21v-5l-2-1.5a2 2 0 01-.8-1.6V7.5a1.5 1.5 0 013 0V10V5.5a1.5 1.5 0 013 0V10V6.5a1.5 1.5 0 013 0V10V8a1.5 1.5 0 013 0v4.5a4 4 0 01-1.3 3L15 17v4"/></svg>),
  chart:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5" fill="currentColor" stroke="none"/><rect x="12" y="8" width="3" height="9" fill="currentColor" stroke="none"/><rect x="17" y="5" width="3" height="12" fill="currentColor" stroke="none"/></svg>),
  shield: (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M12 3l8 3v5.5c0 4.4-3.4 7.8-8 9.5-4.6-1.7-8-5.1-8-9.5V6z"/></svg>),
  boot:   (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h3.5l.8 5.4 9.2 2.4c2 .5 3.5 2.3 3.5 4.4V19H3z"/><path d="M3 19h17M8 13l.4 2M11 13.7l.4 2M14 14.5l.4 1.7"/></svg>),
  x:      (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="currentColor"><path d="M3 3h4.2l5 6.7L17.7 3H21l-7.1 8.1L21.4 21h-4.2l-5.4-7.2L5.4 21H2l7.6-8.7z"/></svg>),
  reply:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||15} height={p.s||15} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8 8 0 01-8 8H4l2-3a8 8 0 1115-5z"/></svg>),
  retweet:(p={}) => (<svg viewBox="0 0 24 24" width={p.s||15} height={p.s||15} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8l3-3 3 3M7 5v10a2 2 0 002 2h7M20 16l-3 3-3-3M17 19V9a2 2 0 00-2-2H8"/></svg>),
  heart:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||15} height={p.s||15} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.4-9.2-8.5C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.2 7C19 15.6 12 20 12 20z"/></svg>),
  shirt:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M8 3l4 2 4-2 5 4-2.5 3L20 11v10H4V11l-2.5-1L4 7z"/></svg>),
  filter: (p={}) => (<svg viewBox="0 0 24 24" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>),
  apple:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||15} height={p.s||15} fill="currentColor"><path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.6-.8.8-1.7 1.1-2.5-2.4-.9-2.5-3.5-2.5-3.5zM14.2 5.6c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1 1.7-.9 2.7 1 .1 2-.5 2.6-1.2z"/></svg>),
  android:(p={}) => (<svg viewBox="0 0 24 24" width={p.s||15} height={p.s||15} fill="currentColor"><path d="M5 9v7a1.5 1.5 0 003 0V9a1.5 1.5 0 00-3 0zm11 0v7a1.5 1.5 0 003 0V9a1.5 1.5 0 00-3 0zM3.5 17.5A1.5 1.5 0 005 19h.5v2a1.5 1.5 0 003 0v-2h3v2a1.5 1.5 0 003 0v-2H19a1.5 1.5 0 001.5-1.5V8h-17v9.5zM15.3 3.8l1-1.5a.3.3 0 00-.5-.3l-1 1.6A6 6 0 0012 3a6 6 0 00-2.8.6L8.2 2a.3.3 0 00-.5.3l1 1.5A5.3 5.3 0 005.5 8h13a5.3 5.3 0 00-3.2-4.2zM9.5 6.2a.7.7 0 110-1.4.7.7 0 010 1.4zm5 0a.7.7 0 110-1.4.7.7 0 010 1.4z"/></svg>),
  arrowUp:(p={}) => (<svg viewBox="0 0 24 24" width={p.s||13} height={p.s||13} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg>),
  close:  (p={}) => (<svg viewBox="0 0 24 24" width={p.s||18} height={p.s||18} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>),
};

/* ───────── Takım arması ───────── */
function Badge({ t, size = 28 }) {
  return (
    <div className="badge" style={{ width: size, height: size, background: t.color, fontSize: size * 0.37 }}>{t.short}</div>
  );
}

/* ───────── Bayraklar ───────── */
const FLAGS = {
  'Türkiye': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#E30A17"/><circle cx="10" cy="12" r="5" fill="#fff"/><circle cx="11.6" cy="12" r="4" fill="#E30A17"/><path d="M15 12l3.2-1-2 2.6V10.4l2 2.6z" fill="#fff"/></svg>,
  'İngiltere': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/><rect x="9.5" width="5" height="24" fill="#CF142B"/><rect y="9.5" width="24" height="5" fill="#CF142B"/></svg>,
  'İspanya': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#F1BF00"/><rect width="24" height="6" fill="#AA151B"/><rect y="18" width="24" height="6" fill="#AA151B"/></svg>,
  'Avrupa': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#003399"/>{Array.from({length:8}).map((_,i)=>{const a=(i/8)*Math.PI*2-Math.PI/2;return <circle key={i} cx={12+Math.cos(a)*6.5} cy={12+Math.sin(a)*6.5} r="1.2" fill="#FFD617"/>;})}</svg>,
  'ABD': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/>{[0,2,4,6,8,10].map(y=><rect key={y} y={y*2} width="24" height="2" fill="#B22234"/>)}<rect width="11" height="13" fill="#3C3B6E"/></svg>,
  'Fransa': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/><rect width="8" height="24" fill="#0055A4"/><rect x="16" width="8" height="24" fill="#EF4135"/></svg>,
  'Almanya': <svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#000"/><rect y="8" width="24" height="8" fill="#DD0000"/><rect y="16" width="24" height="8" fill="#FFCE00"/></svg>,
  'İtalya': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/><rect width="8" height="24" fill="#009246"/><rect x="16" width="8" height="24" fill="#CE2B37"/></svg>,
  'Hollanda': <svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#AE1C28"/><rect y="8" width="24" height="8" fill="#fff"/><rect y="16" width="24" height="8" fill="#21468B"/></svg>,
  'Portekiz': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#FF0000"/><rect width="9.5" height="24" fill="#006600"/><circle cx="9.5" cy="12" r="3" fill="#FFD700"/></svg>,
  'Belçika': <svg viewBox="0 0 24 24"><rect width="8" height="24" fill="#000"/><rect x="8" width="8" height="24" fill="#FDDA24"/><rect x="16" width="8" height="24" fill="#EF3340"/></svg>,
  'Brezilya': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#009C3B"/><path d="M12 4l8 8-8 8-8-8z" fill="#FFDF00"/><circle cx="12" cy="12" r="3.4" fill="#002776"/></svg>,
  'Arjantin': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/><rect width="24" height="8" fill="#74ACDF"/><rect y="16" width="24" height="8" fill="#74ACDF"/><circle cx="12" cy="12" r="2.2" fill="#F6B40E"/></svg>,
  'Sırbistan': <svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#C6363C"/><rect y="8" width="24" height="8" fill="#0C4076"/><rect y="16" width="24" height="8" fill="#fff"/></svg>,
  'Uruguay': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/><rect y="6" width="24" height="2.6" fill="#0038A8"/><rect y="12" width="24" height="2.6" fill="#0038A8"/><rect y="18" width="24" height="2.6" fill="#0038A8"/><circle cx="6" cy="4" r="2.8" fill="#FCD116"/></svg>,
  'Kolombiya': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#FCD116"/><rect y="12" width="24" height="6" fill="#003893"/><rect y="18" width="24" height="6" fill="#CE1126"/></svg>,
  'Nijerya': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/><rect width="8" height="24" fill="#008751"/><rect x="16" width="8" height="24" fill="#008751"/></svg>,
  'Hırvatistan': <svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#FF0000"/><rect y="8" width="24" height="8" fill="#fff"/><rect y="16" width="24" height="8" fill="#171796"/><rect x="9" y="8" width="6" height="6" fill="#FF0000"/></svg>,
  'Slovakya': <svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#0B4EA2"/><rect y="16" width="24" height="8" fill="#EE1620"/></svg>,
  'Fas': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#C1272D"/><path d="M12 8l1.3 4h4.2l-3.4 2.5 1.3 4-3.4-2.5-3.4 2.5 1.3-4-3.4-2.5h4.2z" fill="none" stroke="#006233" strokeWidth="1.1"/></svg>,
  'Bosna': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#002395"/><polygon points="6,3 18,3 6,21" fill="#FECB00"/></svg>,
  'Karadağ': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#C40308"/><rect x="1.5" y="1.5" width="21" height="21" fill="none" stroke="#D4AF37" strokeWidth="2.2"/></svg>,
  'Filistin': <svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#000"/><rect y="8" width="24" height="8" fill="#fff"/><rect y="16" width="24" height="8" fill="#007A3D"/><polygon points="0,0 9,12 0,24" fill="#CE1126"/></svg>,
  'Arnavutluk': <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#E41E20"/><path d="M12 7l3 5-3 5-3-5z" fill="#1a1a1a"/></svg>,
};
function Flag({ country, size = 22 }) {
  return <span className="flag" style={{ width: size, height: size }}>{FLAGS[country] || <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="var(--surface-3)"/></svg>}</span>;
}

/* ───────── Spor ikonu yardımcı ───────── */
function SportIco({ sport, s }) {
  const map = { futbol: I.ball, basket: I.basket, voleybol: I.voley, tenis: I.tennis };
  const C = map[sport] || I.ball;
  return <C s={s} />;
}

/* ───────── Canlı durum etiketi ───────── */
function LiveTag({ m, pulse = true }) {
  return (
    <span className="mr-live">
      <span className={'live-dot' + (pulse ? ' pulse' : '')} />
      <span className="tnum">{m.clock}</span>
    </span>
  );
}

/* uzatma / penaltı rozeti */
function PhasePill({ m }) {
  if (m.pen) return <span className="phase-pill pen">PEN {m.pen.h}-{m.pen.a}</span>;
  if (m.phase === 'et') return <span className="phase-pill et">UZ</span>;
  return null;
}

/* monogram thumb (haber görseli placeholder) */
function Thumb({ seed, label }) {
  const colors = ['#1D428A','#3D195B','#E0123A','#0B1F4E','#F5630B','#1FA95B','#0A6CB0','#6E1423'];
  let h = 0; for (const c of (seed||'x')) h = (h*31 + c.charCodeAt(0)) % 997;
  const c1 = colors[h % colors.length], c2 = colors[(h+3) % colors.length];
  return <div className="thumb-ph" style={{ background: c1 }}>{label}</div>;
}

Object.assign(window, { Logo, I, Badge, Flag, FLAGS, SportIco, LiveTag, PhasePill, Thumb });
