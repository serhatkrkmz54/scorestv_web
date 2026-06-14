/* ScoresTV — demo veri seti (futbol / basket / voleybol) */
window.SCORES = (function () {
  // Lig tanımları
  const leagues = {
    superlig:  { id: 'superlig',  name: 'Süper Lig',            country: 'Türkiye',     sport: 'futbol',   color: '#E40521', round: '35. Hafta' },
    premier:   { id: 'premier',   name: 'Premier League',       country: 'İngiltere',   sport: 'futbol',   color: '#3D195B', round: '33. Hafta' },
    laliga:    { id: 'laliga',    name: 'LaLiga',               country: 'İspanya',     sport: 'futbol',   color: '#E0123A', round: '34. Hafta' },
    ucl:       { id: 'ucl',       name: 'Şampiyonlar Ligi',     country: 'Avrupa',      sport: 'futbol',   color: '#0B1F4E', round: 'Çeyrek Final' },
    euroleague:{ id: 'euroleague',name: 'EuroLeague',           country: 'Avrupa',      sport: 'basket',   color: '#F5630B', round: 'Play-off · 4. Maç' },
    nba:       { id: 'nba',       name: 'NBA',                  country: 'ABD',         sport: 'basket',   color: '#1D428A', round: 'Konferans Finali' },
    sultanlar: { id: 'sultanlar', name: 'Sultanlar Ligi',       country: 'Türkiye',     sport: 'voleybol', color: '#1FA95B', round: 'Final Serisi' },
    cev:       { id: 'cev',       name: 'CEV Şampiyonlar Ligi', country: 'Avrupa',      sport: 'voleybol', color: '#0A6CB0', round: 'Yükselme Play-off' },
  };

  // Takım kısaltma + renk (placeholder armalar için)
  const T = (name, short, color) => ({ name, short, color });

  const matches = [
    // ── SÜPER LİG ──────────────────────────────────────────────
    { id: 'm1', league: 'superlig', status: 'live', clock: "67'",
      home: { ...T('Galatasaray', 'GS', '#C8102E'), score: 2 },
      away: { ...T('Fenerbahçe', 'FB', '#163A8C'), score: 1 },
      note: 'İcardi 23′, 61′ · Tadıc 44′', ht: [1, 1], stream: true, hot: true },
    { id: 'm2', league: 'superlig', status: 'live', clock: "54'",
      home: { ...T('Beşiktaş', 'BJK', '#111418'), score: 1 },
      away: { ...T('Trabzonspor', 'TS', '#6E1423'), score: 1 },
      note: 'Immobile 12′ · Onuachu 39′', ht: [1, 1], stream: true },
    { id: 'm3', league: 'superlig', status: 'upcoming', clock: '21:45',
      home: { ...T('Samsunspor', 'SAM', '#C8102E'), score: null },
      away: { ...T('Başakşehir', 'IBF', '#1B2A5B'), score: null }, stream: true },

    // ── PREMIER LEAGUE ─────────────────────────────────────────
    { id: 'm4', league: 'premier', status: 'live', clock: "38'",
      home: { ...T('Arsenal', 'ARS', '#EF0107'), score: 1 },
      away: { ...T('Liverpool', 'LIV', '#C8102E'), score: 0 },
      note: 'Saka 31′', stream: true, hot: true },
    { id: 'm5', league: 'premier', status: 'upcoming', clock: '22:00',
      home: { ...T('Manchester City', 'MCI', '#6CABDD'), score: null },
      away: { ...T('Chelsea', 'CHE', '#034694'), score: null }, stream: true },
    { id: 'm6', league: 'premier', status: 'finished', clock: 'Bitti',
      home: { ...T('Manchester Utd', 'MUN', '#DA291C'), score: 2 },
      away: { ...T('Tottenham', 'TOT', '#132257'), score: 2 }, ht: [1, 1], stream: false },

    // ── LALIGA ─────────────────────────────────────────────────
    { id: 'm7', league: 'laliga', status: 'live', clock: "72'",
      home: { ...T('Real Madrid', 'RMA', '#C9A24B'), score: 3 },
      away: { ...T('Sevilla', 'SEV', '#D4011A'), score: 1 },
      note: 'Mbappé 9′, 55′ · Bellingham 40′', ht: [2, 0], stream: true },
    { id: 'm8', league: 'laliga', status: 'upcoming', clock: '23:00',
      home: { ...T('Barcelona', 'BAR', '#A50044'), score: null },
      away: { ...T('Atlético Madrid', 'ATM', '#C8102E'), score: null }, stream: true },

    // ── ŞAMPİYONLAR LİGİ ───────────────────────────────────────
    { id: 'm9', league: 'ucl', status: 'upcoming', clock: '22:00',
      home: { ...T('Bayern München', 'BAY', '#DC052D'), score: null },
      away: { ...T('Paris SG', 'PSG', '#004170'), score: null }, stream: true, hot: true },
    { id: 'm10', league: 'ucl', status: 'finished', clock: 'MS (UZT)', phase: 'et',
      home: { ...T('Inter', 'INT', '#0068A8'), score: 2 },
      away: { ...T('Borussia Dortmund', 'BVB', '#FDE100'), score: 1 },
      ht: [0, 1], ft90: [1, 1], winner: 'home', stream: false },
    { id: 'm17', league: 'ucl', status: 'finished', clock: 'MS',
      home: { ...T('Chelsea', 'CHE', '#034694'), score: 1 },
      away: { ...T('Barcelona', 'BAR', '#A50044'), score: 1 },
      ht: [0, 1], pen: { h: 2, a: 4 }, winner: 'away', stream: false },

    // ── EUROLEAGUE (basket) ────────────────────────────────────
    { id: 'm11', league: 'euroleague', status: 'live', clock: 'Ç4 03:12',
      home: { ...T('Anadolu Efes', 'EFS', '#002D62'), score: 78 },
      away: { ...T('Real Madrid', 'RMB', '#C9A24B'), score: 74 },
      note: 'Larkin 22 sayı', stream: true, hot: true },
    { id: 'm12', league: 'euroleague', status: 'upcoming', clock: '20:30',
      home: { ...T('Fenerbahçe Beko', 'FBB', '#163A8C'), score: null },
      away: { ...T('Panathinaikos', 'PAO', '#1B6B3A'), score: null }, stream: true },

    // ── NBA (basket) ───────────────────────────────────────────
    { id: 'm13', league: 'nba', status: 'live', clock: 'Ç3 07:45',
      home: { ...T('LA Lakers', 'LAL', '#552583'), score: 64 },
      away: { ...T('Boston Celtics', 'BOS', '#007A33'), score: 69 }, stream: true },

    // ── SULTANLAR LİGİ (voleybol) ──────────────────────────────
    { id: 'm14', league: 'sultanlar', status: 'live', clock: '3. Set',
      home: { ...T('VakıfBank', 'VAK', '#E8B400'), score: 2 },
      away: { ...T('Eczacıbaşı', 'ECZ', '#F36F21'), score: 1 },
      note: '25-22, 18-25, 11-8', stream: true },
    { id: 'm15', league: 'sultanlar', status: 'upcoming', clock: '19:00',
      home: { ...T('Fenerbahçe Opet', 'FNO', '#163A8C'), score: null },
      away: { ...T('Türk Hava Yolları', 'THY', '#C8102E'), score: null }, stream: false },

    // ── CEV (voleybol) ─────────────────────────────────────────
    { id: 'm16', league: 'cev', status: 'finished', clock: 'Bitti',
      home: { ...T('Zaksa', 'ZAK', '#E40521'), score: 3 },
      away: { ...T('Trentino', 'TRE', '#FFD200'), score: 1 },
      note: '3-1', stream: false },
  ];

  // Maç detay — periyot + zengin event modeli
  // half: 1|2|'et'|'pen' · type: goal|card|sub|var
  const details = {
    m1: {
      events: [
        { min: 23, half: 1, type: 'goal', goal: 'normal', side: 'home', player: 'M. İcardi', assist: 'K. Aktürkoğlu', score: '1-0' },
        { min: 39, half: 1, type: 'var', var: 'pen_confirm', side: 'away', note: 'Penaltı onaylandı' },
        { min: 44, half: 1, type: 'goal', goal: 'pen', side: 'away', player: 'D. Tadıc', score: '1-1' },
        { min: 45, half: 1, type: 'card', card: 'yellow', side: 'away', player: 'İ. Yüksek' },
        { min: 58, half: 2, type: 'sub', side: 'away', inP: 'En-Nesyri', outP: 'Batshuayi' },
        { min: 61, half: 2, type: 'goal', goal: 'normal', side: 'home', player: 'M. İcardi', assist: 'L. Sané', score: '2-1' },
        { min: 64, half: 2, type: 'sub', side: 'home', inP: 'V. Osimhen', outP: 'Barış A.' },
        { min: 70, half: 2, type: 'var', var: 'goal_cancel', side: 'away', note: 'Ofsayt — gol iptal' },
        { min: 77, half: 2, type: 'card', card: 'red', side: 'away', player: 'İ. Yüksek' },
        { min: 84, half: 2, type: 'goal', goal: 'miss', side: 'home', player: 'V. Osimhen', note: 'Penaltı kaçtı' },
      ],
      stats: [
        { label: 'Topla oynama', home: 54, away: 46, pct: true },
        { label: 'Şut', home: 11, away: 7 },
        { label: 'İsabetli şut', home: 5, away: 3 },
        { label: 'Korner', home: 6, away: 4 },
        { label: 'Faul', home: 9, away: 13 },
      ],
      info: { date: '4 Haziran 2026, Çarşamba', time: '20:00', referee: 'Halil Umut Meler', stadium: 'RAMS Park, İstanbul', channel: 'beIN Sports 1' },
      predict: { h: 58, d: 22, a: 20, votes: 48210 },
      h2h: [
        { date: '15 Şub 2026', comp: 'Süper Lig', h: 'FB', a: 'GS', hs: 0, as: 1 },
        { date: '23 Eyl 2025', comp: 'Süper Lig', h: 'GS', a: 'FB', hs: 3, as: 2 },
        { date: '19 May 2025', comp: 'Türkiye Kupası', h: 'GS', a: 'FB', hs: 1, as: 1, penH: 4, penA: 3 },
        { date: '24 Şub 2025', comp: 'Süper Lig', h: 'FB', a: 'GS', hs: 1, as: 1 },
        { date: '6 Eki 2024', comp: 'Süper Lig', h: 'GS', a: 'FB', hs: 2, as: 0 },
        { date: '19 May 2024', comp: 'Süper Lig', h: 'FB', a: 'GS', hs: 0, as: 1 },
      ],
      lineups: {
        home: {
          formation: '4-2-3-1',
          lines: [
            [{ no: 1, n: 'Muslera', pos: 'K', r: 6.8 }],
            [{ no: 2, n: 'Boey', pos: 'D', r: 7.1 }, { no: 6, n: 'Sánchez', pos: 'D', r: 7.4 }, { no: 4, n: 'Bardakcı', pos: 'D', r: 6.9 }, { no: 3, n: 'D. Yılmaz', pos: 'D', r: 7.0 }],
            [{ no: 5, n: 'Torreira', pos: 'O', r: 7.6 }, { no: 8, n: 'Demirbay', pos: 'O', r: 6.7 }],
            [{ no: 10, n: 'Aktürkoğlu', pos: 'O', r: 7.2 }, { no: 19, n: 'Sané', pos: 'O', r: 7.5 }, { no: 17, n: 'Barış A.', pos: 'O', r: 6.6 }],
            [{ no: 9, n: 'İcardi', pos: 'F', cap: true, r: 8.9 }],
          ],
          subs: [
            { no: 45, n: 'Günay', pos: 'K' }, { no: 14, n: 'Osimhen', pos: 'F', r: 7.3, on: 64 },
            { no: 7, n: 'Zaha', pos: 'O' }, { no: 22, n: 'B. Yılmaz', pos: 'D' },
            { no: 88, n: 'Kutlu', pos: 'O' }, { no: 33, n: 'Köhn', pos: 'D' },
          ],
        },
        away: {
          formation: '4-3-3',
          lines: [
            [{ no: 1, n: 'Livaković', pos: 'K', r: 6.5 }],
            [{ no: 2, n: 'Osayi-S.', pos: 'D', r: 6.8 }, { no: 4, n: 'Djiku', pos: 'D', r: 6.4 }, { no: 5, n: 'Becão', pos: 'D', r: 6.6 }, { no: 14, n: 'Kadıoğlu', pos: 'D', r: 7.0 }],
            [{ no: 7, n: 'Yüksek', pos: 'O', r: 6.9 }, { no: 8, n: 'Fred', pos: 'O', cap: true, r: 7.1 }, { no: 17, n: 'Szymański', pos: 'O', r: 7.3 }],
            [{ no: 10, n: 'Tadıc', pos: 'F', r: 7.7 }, { no: 9, n: 'Batshuayi', pos: 'F', r: 6.5 }, { no: 21, n: 'İrfan Can', pos: 'F', r: 6.7 }],
          ],
          subs: [
            { no: 50, n: 'Ertuğrul', pos: 'K' }, { no: 11, n: 'En-Nesyri', pos: 'F', r: 6.6, on: 58 },
            { no: 37, n: 'Crespo', pos: 'O' }, { no: 3, n: 'Mert H.', pos: 'D' },
            { no: 20, n: 'Bardak', pos: 'D' }, { no: 25, n: 'Akaydın', pos: 'D' },
          ],
        },
      },
    },
    m10: {
      info: { date: '4 Haziran 2026, Çarşamba', time: '22:00', referee: 'Clément Turpin', stadium: 'San Siro, Milano', channel: 'TabiiSpor 1' },
      predict: { h: 44, d: 27, a: 29, votes: 21750 },
      h2h: [
        { date: '26 Kas 2025', comp: 'Şampiyonlar Ligi', h: 'BVB', a: 'INT', hs: 1, as: 2 },
        { date: '1 Haz 2024', comp: 'ŞL Finali', h: 'BVB', a: 'INT', hs: 0, as: 2 },
        { date: '14 Eyl 2023', comp: 'Şampiyonlar Ligi', h: 'INT', a: 'BVB', hs: 0, as: 0 },
        { date: '10 Ağu 2022', comp: 'Hazırlık', h: 'INT', a: 'BVB', hs: 1, as: 1 },
      ],
      events: [
        { min: 31, half: 1, type: 'goal', goal: 'normal', side: 'away', player: 'S. Guirassy', assist: 'J. Brandt', score: '0-1' },
        { min: 68, half: 2, type: 'card', card: 'yellow', side: 'home', player: 'H. Çalhanoğlu' },
        { min: 88, half: 2, type: 'goal', goal: 'pen', side: 'home', player: 'L. Martínez', score: '1-1' },
        { min: 97, half: 'et', type: 'goal', goal: 'own', side: 'away', player: 'N. Schlotterbeck', score: '2-1' },
        { min: 118, half: 'et', type: 'sub', side: 'home', inP: 'Bisseck', outP: 'Thuram' },
      ],
    },
    m17: {
      info: { date: '4 Haziran 2026, Çarşamba', time: '22:00', referee: 'Anthony Taylor', stadium: 'Stamford Bridge, Londra', channel: 'TabiiSpor 2' },
      predict: { h: 39, d: 26, a: 35, votes: 33180 },
      h2h: [
        { date: '12 Mar 2026', comp: 'Şampiyonlar Ligi', h: 'BAR', a: 'CHE', hs: 2, as: 2 },
        { date: '20 Nis 2024', comp: 'Hazırlık', h: 'CHE', a: 'BAR', hs: 1, as: 3 },
        { date: '5 Mar 2018', comp: 'Şampiyonlar Ligi', h: 'BAR', a: 'CHE', hs: 3, as: 0 },
      ],
      events: [
        { min: 27, half: 1, type: 'goal', goal: 'normal', side: 'away', player: 'R. Lewandowski', assist: 'Lamine Yamal', score: '0-1' },
        { min: 73, half: 2, type: 'goal', goal: 'normal', side: 'home', player: 'C. Palmer', assist: 'E. Fernández', score: '1-1' },
        { min: 90, half: 'pen', type: 'goal', goal: 'pen', side: 'home', player: 'C. Palmer', note: 'Gol' },
        { min: 90, half: 'pen', type: 'goal', goal: 'pen', side: 'away', player: 'R. Lewandowski', note: 'Gol' },
        { min: 90, half: 'pen', type: 'goal', goal: 'miss', side: 'home', player: 'N. Jackson', note: 'Kaçtı' },
        { min: 90, half: 'pen', type: 'goal', goal: 'pen', side: 'away', player: 'Pedri', note: 'Gol' },
      ],
    },
  };

  // Puan durumu — O G B M Av P, form (son 5)
  const standings = {
    superlig: [
      { t: T('Galatasaray', 'GS', '#C8102E'),  o: 32, g: 26, b: 4, m: 2, av: '+58', p: 82, form: ['G','G','G','B','G'] },
      { t: T('Fenerbahçe', 'FB', '#163A8C'),   o: 32, g: 25, b: 5, m: 2, av: '+51', p: 80, form: ['G','G','B','G','G'] },
      { t: T('Beşiktaş', 'BJK', '#111418'),    o: 32, g: 18, b: 7, m: 7, av: '+19', p: 61, form: ['B','G','M','G','B'] },
      { t: T('Trabzonspor', 'TS', '#6E1423'),  o: 32, g: 16, b: 8, m: 8, av: '+12', p: 56, form: ['G','M','G','B','G'] },
      { t: T('Başakşehir', 'IBF', '#1B2A5B'),  o: 32, g: 15, b: 7, m: 10, av: '+8', p: 52, form: ['M','G','G','B','M'] },
      { t: T('Samsunspor', 'SAM', '#C8102E'),  o: 32, g: 14, b: 9, m: 9, av: '+6', p: 51, form: ['G','B','B','G','M'] },
      { t: T('Eyüpspor', 'EYP', '#5B2A86'),    o: 32, g: 13, b: 8, m: 11, av: '-2', p: 47, form: ['M','M','G','B','G'] },
      { t: T('Antalyaspor', 'ANT', '#C8102E'), o: 32, g: 11, b: 9, m: 12, av: '-5', p: 42, form: ['B','M','G','M','B'] },
    ],
    premier: [
      { t: T('Arsenal', 'ARS', '#EF0107'),       o: 30, g: 22, b: 5, m: 3, av: '+48', p: 71, form: ['G','G','G','G','B'] },
      { t: T('Manchester City', 'MCI', '#6CABDD'),o: 30, g: 21, b: 6, m: 3, av: '+45', p: 69, form: ['G','B','G','G','G'] },
      { t: T('Liverpool', 'LIV', '#C8102E'),     o: 30, g: 20, b: 7, m: 3, av: '+40', p: 67, form: ['G','G','B','G','M'] },
      { t: T('Chelsea', 'CHE', '#034694'),       o: 30, g: 16, b: 8, m: 6, av: '+22', p: 56, form: ['B','G','G','M','G'] },
      { t: T('Tottenham', 'TOT', '#132257'),     o: 30, g: 15, b: 6, m: 9, av: '+11', p: 51, form: ['M','G','M','G','B'] },
      { t: T('Manchester Utd', 'MUN', '#DA291C'),o: 30, g: 13, b: 9, m: 8, av: '+4', p: 48, form: ['B','B','G','M','G'] },
    ],
  };

  // Gol krallığı (lig bazlı) — oyuncu, takım, gol, asist, oynanan maç
  const scorers = {
    superlig: [
      { p: 'M. İcardi', t: T('Galatasaray', 'GS', '#C8102E'), g: 24, a: 7, mp: 30 },
      { p: 'E. Dzeko', t: T('Fenerbahçe', 'FB', '#163A8C'), g: 19, a: 5, mp: 31 },
      { p: 'P. En-Nesyri', t: T('Fenerbahçe', 'FB', '#163A8C'), g: 17, a: 3, mp: 29 },
      { p: 'M. Güçlü', t: T('Eyüpspor', 'EYP', '#5B2A86'), g: 14, a: 2, mp: 32 },
      { p: 'A. Onuachu', t: T('Trabzonspor', 'TS', '#6E1423'), g: 13, a: 4, mp: 28 },
      { p: 'C. Immobile', t: T('Beşiktaş', 'BJK', '#111418'), g: 12, a: 6, mp: 27 },
      { p: 'B. Yılmaz', t: T('Samsunspor', 'SAM', '#C8102E'), g: 11, a: 8, mp: 31 },
    ],
    premier: [
      { p: 'E. Haaland', t: T('Manchester City', 'MCI', '#6CABDD'), g: 26, a: 5, mp: 29 },
      { p: 'M. Salah', t: T('Liverpool', 'LIV', '#C8102E'), g: 22, a: 11, mp: 30 },
      { p: 'B. Saka', t: T('Arsenal', 'ARS', '#EF0107'), g: 18, a: 9, mp: 30 },
      { p: 'C. Palmer', t: T('Chelsea', 'CHE', '#034694'), g: 17, a: 8, mp: 29 },
      { p: 'Son Heung-min', t: T('Tottenham', 'TOT', '#132257'), g: 15, a: 7, mp: 28 },
    ],
  };

  // Takım seçimi — lig lig takım listeleri (id = lig_kısaltma)
  const tm = (lid, name, short, color) => ({ id: lid + '_' + short, name, short, color });
  const teams = [
    { league: 'superlig', list: [
      tm('superlig', 'Galatasaray', 'GS', '#C8102E'), tm('superlig', 'Fenerbahçe', 'FB', '#163A8C'),
      tm('superlig', 'Beşiktaş', 'BJK', '#111418'), tm('superlig', 'Trabzonspor', 'TS', '#6E1423'),
      tm('superlig', 'Başakşehir', 'IBF', '#1B2A5B'), tm('superlig', 'Samsunspor', 'SAM', '#C8102E'),
      tm('superlig', 'Eyüpspor', 'EYP', '#5B2A86'), tm('superlig', 'Antalyaspor', 'ANT', '#C8102E'),
    ] },
    { league: 'premier', list: [
      tm('premier', 'Arsenal', 'ARS', '#EF0107'), tm('premier', 'Manchester City', 'MCI', '#6CABDD'),
      tm('premier', 'Liverpool', 'LIV', '#C8102E'), tm('premier', 'Chelsea', 'CHE', '#034694'),
      tm('premier', 'Tottenham', 'TOT', '#132257'), tm('premier', 'Manchester Utd', 'MUN', '#DA291C'),
    ] },
    { league: 'laliga', list: [
      tm('laliga', 'Real Madrid', 'RMA', '#C9A24B'), tm('laliga', 'Barcelona', 'BAR', '#A50044'),
      tm('laliga', 'Atlético Madrid', 'ATM', '#C8102E'), tm('laliga', 'Sevilla', 'SEV', '#D4011A'),
    ] },
    { league: 'euroleague', list: [
      tm('euroleague', 'Anadolu Efes', 'EFS', '#002D62'), tm('euroleague', 'Fenerbahçe Beko', 'FBB', '#163A8C'),
      tm('euroleague', 'Real Madrid', 'RMB', '#C9A24B'), tm('euroleague', 'Panathinaikos', 'PAO', '#1B6B3A'),
    ] },
    { league: 'nba', list: [
      tm('nba', 'LA Lakers', 'LAL', '#552583'), tm('nba', 'Boston Celtics', 'BOS', '#007A33'),
      tm('nba', 'Golden State', 'GSW', '#1D428A'), tm('nba', 'Miami Heat', 'MIA', '#98002E'),
    ] },
    { league: 'sultanlar', list: [
      tm('sultanlar', 'VakıfBank', 'VAK', '#E8B400'), tm('sultanlar', 'Eczacıbaşı', 'ECZ', '#F36F21'),
      tm('sultanlar', 'Fenerbahçe Opet', 'FNO', '#163A8C'), tm('sultanlar', 'Türk Hava Yolları', 'THY', '#C8102E'),
    ] },
  ];

  // ── UEFA Sıralamaları ──
  // Ülke (milli takım) sıralaması: sıra, ülke, kod, puan, değişim (pozisyon)
  const rankings = {
    nations: [
      { r: 1, name: 'İspanya', country: 'İspanya', pts: 2138, chg: 1 },
      { r: 2, name: 'Fransa', country: 'Fransa', pts: 2106, chg: -1 },
      { r: 3, name: 'Arjantin', country: 'Arjantin', pts: 2087, chg: 0 },
      { r: 4, name: 'İngiltere', country: 'İngiltere', pts: 2044, chg: 2 },
      { r: 5, name: 'Portekiz', country: 'Portekiz', pts: 2012, chg: -1 },
      { r: 6, name: 'Hollanda', country: 'Hollanda', pts: 1998, chg: 0 },
      { r: 7, name: 'Brezilya', country: 'Brezilya', pts: 1976, chg: -2 },
      { r: 8, name: 'Belçika', country: 'Belçika', pts: 1945, chg: 1 },
      { r: 9, name: 'İtalya', country: 'İtalya', pts: 1918, chg: 0 },
      { r: 10, name: 'Almanya', country: 'Almanya', pts: 1901, chg: 3 },
      { r: 22, name: 'Türkiye', country: 'Türkiye', pts: 1592, chg: 4, hi: true },
    ],
    // Kulüp katsayıları: sıra, takım, ülke, 5 yıllık katsayı, değişim
    clubs: [
      { r: 1, t: T('Real Madrid', 'RMA', '#C9A24B'), country: 'İspanya', pts: 142.0, chg: 0 },
      { r: 2, t: T('Manchester City', 'MCI', '#6CABDD'), country: 'İngiltere', pts: 139.5, chg: 0 },
      { r: 3, t: T('Bayern München', 'BAY', '#DC052D'), country: 'Almanya', pts: 136.0, chg: 1 },
      { r: 4, t: T('Liverpool', 'LIV', '#C8102E'), country: 'İngiltere', pts: 131.0, chg: -1 },
      { r: 5, t: T('Inter', 'INT', '#0068A8'), country: 'İtalya', pts: 124.0, chg: 2 },
      { r: 6, t: T('Paris SG', 'PSG', '#004170'), country: 'Fransa', pts: 122.0, chg: -1 },
      { r: 7, t: T('Barcelona', 'BAR', '#A50044'), country: 'İspanya', pts: 119.0, chg: 1 },
      { r: 8, t: T('Borussia Dortmund', 'BVB', '#FDE100'), country: 'Almanya', pts: 112.0, chg: -1 },
      { r: 12, t: T('Galatasaray', 'GS', '#C8102E'), country: 'Türkiye', pts: 88.5, chg: 3, hi: true },
      { r: 18, t: T('Fenerbahçe', 'FB', '#163A8C'), country: 'Türkiye', pts: 71.0, chg: 2, hi: true },
    ],
  };

  return { date: 'Çar, 4 Haziran', leagues, matches, details, standings, teams, scorers, rankings };
})();
