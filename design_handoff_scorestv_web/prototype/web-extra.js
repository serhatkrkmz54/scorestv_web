/* ScoresTV WEB — veri eklentisi: tenis, haberler, oyuncu/takım profilleri */
(function () {
  const S = window.SCORES;
  const T = (name, short, color) => ({ name, short, color });

  // ── Tenis ligi + maçları (set bazlı) ──
  S.leagues.atp = { id: 'atp', name: 'ATP Roland Garros', country: 'Fransa', sport: 'tenis', color: '#B85C1E', round: 'Çeyrek Final' };
  S.leagues.wta = { id: 'wta', name: 'WTA Roma', country: 'İtalya', sport: 'tenis', color: '#1FA95B', round: 'Yarı Final' };

  S.matches.push(
    { id: 't1', league: 'atp', status: 'live', clock: '2. Set', sets: [[6,4],[3,2]],
      home: { ...T('C. Alcaraz', 'ALC', '#B85C1E'), score: 1 },
      away: { ...T('J. Sinner', 'SIN', '#2A6FDB'), score: 0 }, stream: true, hot: true },
    { id: 't2', league: 'atp', status: 'upcoming', clock: '16:00',
      home: { ...T('N. Djokovic', 'DJO', '#C6363C'), score: null },
      away: { ...T('A. Zverev', 'ZVE', '#222'), score: null }, stream: true },
    { id: 't3', league: 'wta', status: 'finished', clock: 'Bitti', sets: [[6,3],[6,4]],
      home: { ...T('A. Sabalenka', 'SAB', '#E8B400'), score: 2 },
      away: { ...T('I. Swiatek', 'SWI', '#1FA95B'), score: 0 }, winner: 'home', stream: false },
  );

  // ── Haberler ──
  S.news = [
    { id: 'n1', cat: 'Süper Lig', tag: 'GS', tagColor: '#C8102E', time: '12 dk önce', big: true,
      title: 'İcardi derbi gecesi tarihe geçti: Galatasaray Fenerbahçe karşısında öne geçti', summary: 'Arjantinli yıldız 23. ve 61. dakikalarda fileleri havalandırdı.' },
    { id: 'n2', cat: 'Transfer', tag: 'TR', tagColor: '#3D195B', time: '38 dk önce',
      title: 'Premier League devi, Süper Lig’in genç yıldızı için kolları sıvadı', summary: 'İngiliz kulübü, sezon sonu için resmi temaslara başladı; bonservis için ilk teklif masada.' },
    { id: 'n3', cat: 'Şampiyonlar Ligi', tag: 'UCL', tagColor: '#0B1F4E', time: '1 saat önce',
      title: 'Çeyrek final kurası belli oldu: Dev eşleşmeler kapıda', summary: 'Son sekiz takım belli oldu; eşleşmeler şimdiden Avrupa’yı ayağa kaldırdı.' },
    { id: 'n4', cat: 'NBA', tag: 'NBA', tagColor: '#1D428A', time: '2 saat önce',
      title: 'Konferans finalinde seri 2-2’ye geldi, kritik 5. maç yarın', summary: 'Seriyi koparmak isteyen iki ekip, deplasmandaki kritik maça kilitlendi.' },
    { id: 'n5', cat: 'Tenis', tag: 'RG', tagColor: '#B85C1E', time: '3 saat önce',
      title: 'Roland Garros’ta Alcaraz–Sinner çeyrek finali nefesleri kesiyor' },
    { id: 'n6', cat: 'Voleybol', tag: 'VNL', tagColor: '#1FA95B', time: '4 saat önce',
      title: 'Filenin Sultanları Milletler Ligi’ne galibiyetle başladı' },
    { id: 'n7', cat: 'LaLiga', tag: 'RMA', tagColor: '#C9A24B', time: '5 saat önce',
      title: 'Mbappé sezonu çift haneli gol rakamıyla kapatma yolunda' },
    { id: 'n8', cat: 'Süper Lig', tag: 'TS', tagColor: '#6E1423', time: '6 saat önce',
      title: 'Trabzonspor’da teknik direktör cephesinde sürpriz gelişme' },
  ];

  // ── X / Twitter akışı ──
  const X = (name, handle, color, verified) => ({ name, handle, color, verified });
  S.tweets = [
    { ...X('ScoresTV', '@scorestv', '#E5364B', true), time: '2 dk', text: 'GOOOL! 🔴🟡 Galatasaray 2-1 öne geçti! İcardi 61. dakikada ağları havalandırdı. Derbi nefes kesiyor! #GSFB', reps: '320', rts: '1,4B', likes: '5,2B' },
    { ...X('beIN SPORTS Türkiye', '@beINSPORTS_TR', '#5A2D82', true), time: '14 dk', text: '⏱️ İlk yarı sona erdi! Kadıköy’de dev derbide skor şu an 2-1. İkinci yarı tüm heyecanıyla beIN SPORTS 1’de!', reps: '210', rts: '640', likes: '3,1B' },
    { ...X('UEFA Şampiyonlar Ligi', '@ChampionsLeague', '#0B1F4E', true), time: '1 sa', text: '🏆 Çeyrek final kuraları çekildi! Dev eşleşmeler bizi bekliyor. Sizce favori kim?', reps: '1,2B', rts: '8,3B', likes: '22B' },
    { ...X('NBA', '@NBA', '#1D428A', true), time: '2 sa', text: '🔥 Ne final ama! Konferans finalinde seri 2-2’ye geldi. 5. maç için geri sayım başladı.', reps: '3,4B', rts: '12B', likes: '48B' },
    { ...X('Roland Garros', '@rolandgarros', '#B85C1E', true), time: '3 sa', text: '🎾 Alcaraz vs Sinner çeyrek finalde! Court Philippe-Chatrier’de tarihi bir maça hazır olun. 16:00’da başlıyor.', reps: '540', rts: '2,1B', likes: '9,7B' },
  ];

  // ── Oyuncu profilleri ──
  S.players = {
    'M. İcardi': {
      name: 'Mauro İcardi', team: T('Galatasaray', 'GS', '#C8102E'), pos: 'Santrfor', no: 9,
      nat: 'Arjantin', age: 33, height: '181 cm', foot: 'Sağ', value: '€12.0M',
      season: { mp: 30, g: 24, a: 7, min: 2480, rating: 7.8, yellow: 3, red: 0 },
      radar: [{ k: 'Bitiricilik', v: 92 }, { k: 'Pas', v: 64 }, { k: 'Hız', v: 58 }, { k: 'Fizik', v: 80 }, { k: 'Dripling', v: 62 }, { k: 'Hava', v: 86 }],
      recent: [
        { opp: T('Fenerbahçe','FB','#163A8C'), comp: 'Süper Lig', res: '2-1', g: 2, a: 0, r: 8.9 },
        { opp: T('Trabzonspor','TS','#6E1423'), comp: 'Süper Lig', res: '3-0', g: 1, a: 1, r: 8.1 },
        { opp: T('Beşiktaş','BJK','#111418'), comp: 'Süper Lig', res: '2-2', g: 1, a: 0, r: 7.4 },
        { opp: T('Başakşehir','IBF','#1B2A5B'), comp: 'Süper Lig', res: '4-1', g: 2, a: 1, r: 8.6 },
        { opp: T('Samsunspor','SAM','#C8102E'), comp: 'Süper Lig', res: '1-1', g: 0, a: 0, r: 6.8 },
      ],
    },
    'M. Salah': {
      name: 'Mohamed Salah', team: T('Liverpool', 'LIV', '#C8102E'), pos: 'Kanat', no: 11,
      nat: 'Brezilya', age: 33, height: '175 cm', foot: 'Sol', value: '€55.0M',
      season: { mp: 30, g: 22, a: 11, min: 2610, rating: 7.9, yellow: 2, red: 0 },
      radar: [{ k: 'Bitiricilik', v: 88 }, { k: 'Pas', v: 78 }, { k: 'Hız', v: 90 }, { k: 'Fizik', v: 70 }, { k: 'Dripling', v: 86 }, { k: 'Hava', v: 52 }],
      recent: [
        { opp: T('Arsenal','ARS','#EF0107'), comp: 'Premier Lig', res: '1-1', g: 1, a: 0, r: 7.6 },
        { opp: T('Chelsea','CHE','#034694'), comp: 'Premier Lig', res: '3-1', g: 1, a: 2, r: 8.7 },
        { opp: T('Tottenham','TOT','#132257'), comp: 'Premier Lig', res: '2-0', g: 0, a: 1, r: 7.5 },
      ],
    },
  };

  // ── Takım profilleri (kadro özet + son maçlar) ──
  S.teamProfiles = {
    GS: {
      name: 'Galatasaray', short: 'GS', color: '#C8102E', country: 'Türkiye',
      league: 'superlig', founded: 1905, stadium: 'RAMS Park', city: 'İstanbul', coach: 'Okan Buruk',
      form: ['G','G','G','B','G'], pos: 1,
      stats: { gf: 78, ga: 24, cs: 14, sh: 2.1 },
      squad: {
        Kaleci: [{ n: 'F. Muslera', no: 1, nat: 'Uruguay', cap: true }, { n: 'G. Güney', no: 45, nat: 'Türkiye' }],
        Defans: [{ n: 'D. Sánchez', no: 6, nat: 'Kolombiya' }, { n: 'A. Bardakcı', no: 4, nat: 'Türkiye' }, { n: 'S. Boey', no: 2, nat: 'Fransa' }, { n: 'D. Yılmaz', no: 3, nat: 'Türkiye' }],
        Ortasaha: [{ n: 'L. Torreira', no: 5, nat: 'Uruguay' }, { n: 'K. Demirbay', no: 8, nat: 'Almanya' }, { n: 'L. Sané', no: 19, nat: 'Almanya' }, { n: 'K. Aktürkoğlu', no: 10, nat: 'Türkiye' }],
        Forvet: [{ n: 'M. İcardi', no: 9, nat: 'Arjantin' }, { n: 'V. Osimhen', no: 14, nat: 'Nijerya' }, { n: 'Barış A. Yılmaz', no: 17, nat: 'Türkiye' }],
      },
      recent: [
        { opp: T('Fenerbahçe','FB','#163A8C'), comp: 'Süper Lig', ha: 'E', res: '2-1', win: 'w' },
        { opp: T('Trabzonspor','TS','#6E1423'), comp: 'Süper Lig', ha: 'D', res: '3-0', win: 'w' },
        { opp: T('Beşiktaş','BJK','#111418'), comp: 'Süper Lig', ha: 'E', res: '2-2', win: 'd' },
        { opp: T('Samsunspor','SAM','#C8102E'), comp: 'Süper Lig', ha: 'D', res: '1-1', win: 'd' },
        { opp: T('Başakşehir','IBF','#1B2A5B'), comp: 'Süper Lig', ha: 'E', res: '4-1', win: 'w' },
      ],
      next: [
        { opp: T('Antalyaspor','ANT','#C8102E'), comp: 'Süper Lig', ha: 'D', when: 'Paz 19:00' },
        { opp: T('Eyüpspor','EYP','#5B2A86'), comp: 'Süper Lig', ha: 'E', when: 'Cmt 21:45' },
      ],
    },
    FB: {
      name: 'Fenerbahçe', short: 'FB', color: '#163A8C', country: 'Türkiye',
      league: 'superlig', founded: 1907, stadium: 'Ülker Stadyumu', city: 'İstanbul', coach: 'José Mourinho',
      form: ['G','B','G','G','M'], pos: 2,
      stats: { gf: 74, ga: 28, cs: 12, sh: 1.9 },
      squad: {
        Kaleci: [{ n: 'D. Livaković', no: 1, nat: 'Hırvatistan', cap: true }, { n: 'İ. Eğribayat', no: 50, nat: 'Türkiye' }],
        Defans: [{ n: 'A. Söyüncü', no: 4, nat: 'Türkiye' }, { n: 'M. Skriniar', no: 37, nat: 'Slovakya' }, { n: 'B. Oosterwolde', no: 25, nat: 'Hollanda' }, { n: 'M. Müldür', no: 2, nat: 'Türkiye' }],
        Ortasaha: [{ n: 'İ. Y. En-Nesyri', no: 8, nat: 'Fas' }, { n: 'S. Amrabat', no: 34, nat: 'Fas' }, { n: 'F. Tadić', no: 10, nat: 'Sırbistan' }, { n: 'İrfan Can K.', no: 7, nat: 'Türkiye' }],
        Forvet: [{ n: 'E. Dzeko', no: 9, nat: 'Bosna' }, { n: 'D. Tadić', no: 10, nat: 'Sırbistan' }, { n: 'C. Ünder', no: 17, nat: 'Türkiye' }],
      },
      recent: [
        { opp: T('Galatasaray','GS','#C8102E'), comp: 'Süper Lig', ha: 'D', res: '1-2', win: 'l' },
        { opp: T('Beşiktaş','BJK','#111418'), comp: 'Süper Lig', ha: 'E', res: '3-1', win: 'w' },
        { opp: T('Trabzonspor','TS','#6E1423'), comp: 'Süper Lig', ha: 'D', res: '2-2', win: 'd' },
        { opp: T('Kasımpaşa','KAS','#1A3C7A'), comp: 'Süper Lig', ha: 'E', res: '4-0', win: 'w' },
        { opp: T('Rizespor','RIZ','#0B6B3A'), comp: 'Süper Lig', ha: 'D', res: '2-0', win: 'w' },
      ],
      next: [
        { opp: T('Konyaspor','KON','#16934A'), comp: 'Süper Lig', ha: 'D', when: 'Paz 21:45' },
        { opp: T('Gaziantep','GFK','#B0121A'), comp: 'Süper Lig', ha: 'E', when: 'Cmt 19:00' },
      ],
    },
    TS: {
      name: 'Trabzonspor', short: 'TS', color: '#6E1423', country: 'Türkiye',
      league: 'superlig', founded: 1967, stadium: 'Papara Park', city: 'Trabzon', coach: 'Şenol Güneş',
      form: ['B','G','M','G','B'], pos: 4,
      stats: { gf: 56, ga: 42, cs: 9, sh: 1.4 },
      squad: {
        Kaleci: [{ n: 'U. Çakır', no: 1, nat: 'Türkiye', cap: true }, { n: 'E. Bayındır', no: 34, nat: 'Türkiye' }],
        Defans: [{ n: 'S. Bartra', no: 5, nat: 'İspanya' }, { n: 'S. Savić', no: 3, nat: 'Karadağ' }, { n: 'M. Eze', no: 12, nat: 'Nijerya' }, { n: 'A. Pereira', no: 24, nat: 'Portekiz' }],
        Ortasaha: [{ n: 'O. Hüseyinov', no: 6, nat: 'Türkiye' }, { n: 'T. Bsharat', no: 8, nat: 'Filistin' }, { n: 'A. Visca', no: 22, nat: 'Bosna' }, { n: 'E. Zubir', no: 11, nat: 'Fas' }],
        Forvet: [{ n: 'P. Onuachu', no: 45, nat: 'Nijerya' }, { n: 'A. Augusto', no: 7, nat: 'Brezilya' }, { n: 'S. Muçi', no: 99, nat: 'Arnavutluk' }],
      },
      recent: [
        { opp: T('Beşiktaş','BJK','#111418'), comp: 'Süper Lig', ha: 'D', res: '1-1', win: 'd' },
        { opp: T('Galatasaray','GS','#C8102E'), comp: 'Süper Lig', ha: 'E', res: '0-3', win: 'l' },
        { opp: T('Fenerbahçe','FB','#163A8C'), comp: 'Süper Lig', ha: 'E', res: '2-2', win: 'd' },
        { opp: T('Antalyaspor','ANT','#C8102E'), comp: 'Süper Lig', ha: 'D', res: '3-1', win: 'w' },
        { opp: T('Samsunspor','SAM','#C8102E'), comp: 'Süper Lig', ha: 'E', res: '1-2', win: 'l' },
      ],
      next: [
        { opp: T('Hatayspor','HTY','#751010'), comp: 'Süper Lig', ha: 'D', when: 'Cmt 16:00' },
        { opp: T('Alanyaspor','ALN','#0B6B3A'), comp: 'Süper Lig', ha: 'E', when: 'Paz 19:00' },
      ],
    },
  };
})();
