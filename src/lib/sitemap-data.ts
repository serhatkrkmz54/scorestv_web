import "server-only";

// Sitemap verisi — route handler'lar (index + alt sitemap'ler) burayi kullanir.
// Her varlik HEM EN HEM TR url'i ile + hreflang alternatifleriyle listelenir.
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorestv.com";
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";
export const PAGE_SIZE = 10000; // varlik/sayfa; URL/sayfa bunun 2 kati (EN+TR)

export interface Counts {
  teams: number;
  players: number;
  leagues: number;
  matches: number;
}
export interface Alt {
  hreflang: string;
  href: string;
}
export interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  alternates?: Alt[];
}

// Backend'e ulasilamazsa null doner — route 503 versin diye. 0'li sayimlarla
// 200 donmek Google'a "bu sitemap'ler kaldirildi" sinyali verirdi; 503 ise
// "gecici, sonra tekrar gel" demek (eski sitemap bilgisi korunur).
export async function fetchCounts(): Promise<Counts | null> {
  try {
    const r = await fetch(`${BACKEND}/api/v1/sitemap/counts`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as Partial<Counts>;
    return {
      teams: j.teams ?? 0,
      players: j.players ?? 0,
      leagues: j.leagues ?? 0,
      matches: j.matches ?? 0,
    };
  } catch {
    return null;
  }
}

export function sitemapFiles(c: Counts): string[] {
  const files = ["static", "news"];
  const add = (type: string, count: number) => {
    const pages = count > 0 ? Math.ceil(count / PAGE_SIZE) : 0;
    for (let p = 0; p < pages; p++) files.push(`${type}-${p}`);
  };
  add("leagues", c.leagues);
  add("teams", c.teams);
  add("players", c.players);
  add("matches", c.matches);
  return files;
}

// Statik sayfalar. Cogu tek URL (TR/EN ayni adreste, cookie ile dil);
// TR<->EN ayri URL'i olan ciftler STATIC_PAIRS ile hreflang alternates alir.
const STATIC: { path: string; priority: string; freq: string }[] = [
  { path: "/", priority: "1.0", freq: "hourly" },
  { path: "/canli-mac-programi", priority: "0.8", freq: "hourly" },
  { path: "/basketbol", priority: "0.8", freq: "hourly" },
  { path: "/basketball", priority: "0.8", freq: "hourly" },
  { path: "/siralama", priority: "0.7", freq: "daily" },
  { path: "/haberler", priority: "0.6", freq: "daily" },
  { path: "/news", priority: "0.6", freq: "daily" },
  { path: "/oyunlar", priority: "0.6", freq: "weekly" },
  { path: "/games", priority: "0.6", freq: "weekly" },
  { path: "/ai-performans", priority: "0.5", freq: "daily" },
  { path: "/ai-performance", priority: "0.5", freq: "daily" },
  { path: "/indir", priority: "0.5", freq: "monthly" },
  { path: "/download", priority: "0.5", freq: "monthly" },
  { path: "/hakkimizda", priority: "0.4", freq: "monthly" },
  { path: "/iletisim", priority: "0.4", freq: "monthly" },
  { path: "/reklam", priority: "0.3", freq: "monthly" },
  { path: "/kariyer", priority: "0.3", freq: "monthly" },
  { path: "/gizlilik", priority: "0.2", freq: "yearly" },
  { path: "/kullanim-sartlari", priority: "0.2", freq: "yearly" },
  { path: "/cerez-politikasi", priority: "0.2", freq: "yearly" },
  { path: "/kvkk", priority: "0.2", freq: "yearly" },
];

// TR<->EN URL cifti olan statik sayfalar — her iki girise ayni hreflang seti.
const STATIC_PAIR_LIST: { tr: string; en: string }[] = [
  { tr: "/basketbol", en: "/basketball" },
  { tr: "/haberler", en: "/news" },
  { tr: "/oyunlar", en: "/games" },
  { tr: "/ai-performans", en: "/ai-performance" },
  { tr: "/indir", en: "/download" },
];
const STATIC_PAIRS = new Map<string, { tr: string; en: string }>();
for (const p of STATIC_PAIR_LIST) {
  STATIC_PAIRS.set(p.tr, p);
  STATIC_PAIRS.set(p.en, p);
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** lastmod (ISO) uzerinden bugune kadar gecen gun sayisi; yoksa cok buyuk. */
function daysSince(iso?: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return (Date.now() - t) / 86400000;
}

// Maclarda oncelik ve changefreq son guncelleme (lastmod=updatedAt) tazeligine
// gore dinamiktir: canli/yeni biten/kadro aciklanan maclar taze -> yuksek
// oncelik + sik tarama; atil/eski maclar -> dusuk. Boylece Google tarama
// butcesi guncel iceriklere yonelir.
function matchChangefreq(iso?: string | null): string {
  const d = daysSince(iso);
  if (d < 1) return "hourly";
  if (d < 3) return "daily";
  if (d < 14) return "weekly";
  return "monthly";
}
function matchPriority(iso?: string | null): string {
  const d = daysSince(iso);
  if (d < 1) return "0.9";
  if (d < 3) return "0.8";
  if (d < 14) return "0.6";
  if (d < 60) return "0.4";
  return "0.3";
}

// Ligler icin popularite sinyali: config'teki populer lig ID'leri (sol ray ile
// ayni kaynak). Bu set'i sitemap uretiminde bir kez cekip ID'ye gore oncelik
// veririz — boylece Google tarama butcesi onemli liglere (Super Lig, Premier,
// UCL...) yonelir, binlerce kucuk/atil lig geride kalir. Hata olursa bos set
// (tum ligler tazelik-bazli dereceye duser) — nazik degradasyon.
async function fetchPopularLeagueIds(): Promise<Set<number>> {
  try {
    const r = await fetch(`${BACKEND}/api/v1/leagues/popular?lang=en`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return new Set();
    const list = (await r.json()) as { id?: number }[];
    const out = new Set<number>();
    for (const l of list) {
      if (typeof l.id === "number") out.add(l.id);
    }
    return out;
  } catch {
    return new Set();
  }
}

// URL path'inin sonundaki "-{id}" kismindan lig ID'sini cikarir (/league/x-203).
function idFromPath(path: string): number | null {
  const m = /-(\d+)$/.exec(path);
  return m ? Number(m[1]) : null;
}

// Lig oncelik/changefreq: populer -> yuksek+sik; degilse son guncelleme
// tazeligine gore (aktif ligler orta, atil ligler dusuk).
function leaguePriority(popular: boolean, iso?: string | null): string {
  if (popular) return "0.9";
  const d = daysSince(iso);
  if (d < 30) return "0.5";
  return "0.3";
}
function leagueChangefreq(popular: boolean, iso?: string | null): string {
  if (popular) return "daily";
  const d = daysSince(iso);
  if (d < 30) return "weekly";
  return "monthly";
}

// Haber (news) alt sitemap'i — yayindaki haber detay URL'leri. Haber DILE OZEL
// (TR haber /haber/<slug>, EN haber /news/<slug>). Her iki dilin listesini ayri
// ceker; hata olursa o dil bos (nazik degradasyon). Yeni haberler taze ->
// yuksek oncelik + sik tarama.
async function newsEntries(): Promise<UrlEntry[] | null> {
  const out: UrlEntry[] = [];
  let anyOk = false; // iki dil de cekilemezse null -> route 503 versin
  const langs: { lang: "tr" | "en"; prefix: string }[] = [
    { lang: "tr", prefix: "/haber" },
    { lang: "en", prefix: "/news" },
  ];
  for (const { lang, prefix } of langs) {
    try {
      const r = await fetch(
        `${BACKEND}/api/v1/news?lang=${lang}&page=0&size=1000`,
        { cache: "no-store", signal: AbortSignal.timeout(15_000) },
      );
      if (!r.ok) continue;
      const j = (await r.json()) as {
        items?: { slug: string; publishedAt: string | null }[];
      };
      anyOk = true;
      for (const it of j.items ?? []) {
        if (!it.slug) continue;
        const lm = it.publishedAt ?? undefined;
        out.push({
          loc: `${SITE}${prefix}/${it.slug}`,
          lastmod: lm,
          changefreq: matchChangefreq(lm),
          priority: matchPriority(lm),
        });
      }
    } catch {
      /* o dil icin bos — devam */
    }
  }
  return anyOk ? out : null;
}

// null donus = backend'e ulasilamadi; route 503 vermeli (bos 200 degil).
export async function entriesFor(name: string): Promise<UrlEntry[] | null> {
  if (name === "static") {
    return STATIC.map((s) => {
      const pair = STATIC_PAIRS.get(s.path);
      const alternates: Alt[] | undefined = pair
        ? [
            { hreflang: "tr", href: SITE + pair.tr },
            { hreflang: "en", href: SITE + pair.en },
            { hreflang: "x-default", href: SITE + pair.en },
          ]
        : undefined;
      return {
        loc: SITE + s.path,
        changefreq: s.freq,
        priority: s.priority,
        alternates,
      };
    });
  }
  if (name === "news") {
    return newsEntries();
  }
  const m = /^(leagues|teams|players|matches)-(\d+)$/.exec(name);
  if (!m) return [];
  const type = m[1];
  const page = Number(m[2]);
  try {
    const r = await fetch(
      `${BACKEND}/api/v1/sitemap/${type}?page=${page}&size=${PAGE_SIZE}`,
      { cache: "no-store", signal: AbortSignal.timeout(15_000) },
    );
    if (!r.ok) return null;
    const list = (await r.json()) as {
      enPath: string;
      trPath: string;
      lastmod: string | null;
    }[];
    const isMatch = type === "matches";
    const isLeague = type === "leagues";
    // Ligler: config'teki populer set'e gore oncelik (yuksek) vs tazelik (dusuk).
    const popularLeagueIds = isLeague ? await fetchPopularLeagueIds() : null;
    // Mac/lig disi tipler: mevcut statik degerler. Mac + lig: entry basina dinamik.
    const staticFreq =
      type === "players" || type === "matches" ? "monthly" : "weekly";
    const staticPrio =
      type === "matches" ? "0.4" : "0.5";
    const out: UrlEntry[] = [];
    for (const e of list) {
      const enUrl = SITE + e.enPath;
      const trUrl = SITE + e.trPath;
      // Her dil versiyonu ayri <url>; ikisi de tam hreflang setini tasir.
      const alternates: Alt[] = [
        { hreflang: "en", href: enUrl },
        { hreflang: "tr", href: trUrl },
        { hreflang: "x-default", href: enUrl },
      ];
      const lm = e.lastmod ?? undefined;
      let freq: string;
      let prio: string;
      if (isMatch) {
        freq = matchChangefreq(lm);
        prio = matchPriority(lm);
      } else if (isLeague) {
        const id = idFromPath(e.enPath);
        const popular = id != null && (popularLeagueIds?.has(id) ?? false);
        freq = leagueChangefreq(popular, lm);
        prio = leaguePriority(popular, lm);
      } else {
        freq = staticFreq;
        prio = staticPrio;
      }
      out.push({ loc: enUrl, lastmod: lm, changefreq: freq, priority: prio, alternates });
      out.push({ loc: trUrl, lastmod: lm, changefreq: freq, priority: prio, alternates });
    }
    return out;
  } catch {
    return null;
  }
}

export function urlsetXml(entries: UrlEntry[]): string {
  const rows = entries
    .map((e) => {
      let s = `  <url>\n    <loc>${xmlEscape(e.loc)}</loc>\n`;
      for (const a of e.alternates ?? []) {
        s += `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(a.href)}"/>\n`;
      }
      if (e.lastmod) s += `    <lastmod>${e.lastmod}</lastmod>\n`;
      if (e.changefreq) s += `    <changefreq>${e.changefreq}</changefreq>\n`;
      if (e.priority) s += `    <priority>${e.priority}</priority>\n`;
      s += `  </url>`;
      return s;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rows}
</urlset>`;
}

export function indexXml(files: string[]): string {
  // lastmod bilerek YOK: her istekte "simdi" yazmak Google'a lastmod'un
  // guvenilmez oldugunu ogretir (changefreq/priority'yi zaten yok sayiyor;
  // ciddiye aldigi tek alan lastmod — yalan soylememek daha degerli).
  const rows = files
    .map((f) => `  <sitemap>\n    <loc>${SITE}/sitemap/${f}.xml</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</sitemapindex>`;
}
