// Kayıt formundaki ülke seçici için liste. value = backend'e gönderilen ad.
export interface Country { code: string; tr: string; en: string; }

export const COUNTRIES: Country[] = [
  { code: "TR", tr: "Türkiye", en: "Turkey" },
  { code: "DE", tr: "Almanya", en: "Germany" },
  { code: "GB", tr: "Birleşik Krallık", en: "United Kingdom" },
  { code: "US", tr: "Amerika Birleşik Devletleri", en: "United States" },
  { code: "FR", tr: "Fransa", en: "France" },
  { code: "ES", tr: "İspanya", en: "Spain" },
  { code: "IT", tr: "İtalya", en: "Italy" },
  { code: "NL", tr: "Hollanda", en: "Netherlands" },
  { code: "PT", tr: "Portekiz", en: "Portugal" },
  { code: "BE", tr: "Belçika", en: "Belgium" },
  { code: "AT", tr: "Avusturya", en: "Austria" },
  { code: "CH", tr: "İsviçre", en: "Switzerland" },
  { code: "AZ", tr: "Azerbaycan", en: "Azerbaijan" },
  { code: "RU", tr: "Rusya", en: "Russia" },
  { code: "UA", tr: "Ukrayna", en: "Ukraine" },
  { code: "GR", tr: "Yunanistan", en: "Greece" },
  { code: "BR", tr: "Brezilya", en: "Brazil" },
  { code: "AR", tr: "Arjantin", en: "Argentina" },
  { code: "SA", tr: "Suudi Arabistan", en: "Saudi Arabia" },
  { code: "QA", tr: "Katar", en: "Qatar" },
  { code: "AE", tr: "Birleşik Arap Emirlikleri", en: "United Arab Emirates" },
  { code: "OTHER", tr: "Diğer", en: "Other" },
];

export function countryLabel(c: Country, lang: "tr" | "en"): string {
  return lang === "tr" ? c.tr : c.en;
}

/**
 * Yayın ülkeleri (TheSportsDB İngilizce verir) için TR adı. Yukarıdaki kısa
 * picker listesi + yayınlarda sık geçen ülkeler. Eşleşme yoksa İngilizce kalır.
 */
const EXTRA_COUNTRY_TR: Record<string, string> = {
  venezuela: "Venezuela",
  iceland: "İzlanda",
  denmark: "Danimarka",
  finland: "Finlandiya",
  slovakia: "Slovakya",
  sweden: "İsveç",
  slovenia: "Slovenya",
  ireland: "İrlanda",
  "south africa": "Güney Afrika",
  bolivia: "Bolivya",
  canada: "Kanada",
  serbia: "Sırbistan",
  hungary: "Macaristan",
  norway: "Norveç",
  kenya: "Kenya",
  israel: "İsrail",
  albania: "Arnavutluk",
  poland: "Polonya",
  "the netherlands": "Hollanda",
  australia: "Avustralya",
  croatia: "Hırvatistan",
  romania: "Romanya",
  bulgaria: "Bulgaristan",
  "czech republic": "Çekya",
  czechia: "Çekya",
  "south korea": "Güney Kore",
  japan: "Japonya",
  mexico: "Meksika",
  colombia: "Kolombiya",
  chile: "Şili",
  peru: "Peru",
  uruguay: "Uruguay",
  ecuador: "Ekvador",
  morocco: "Fas",
  egypt: "Mısır",
  nigeria: "Nijerya",
  usa: "Amerika Birleşik Devletleri",
  uk: "Birleşik Krallık",
  china: "Çin",
  india: "Hindistan",
  indonesia: "Endonezya",
  "new zealand": "Yeni Zelanda",
  greece: "Yunanistan",
};

export function localizedCountryName(enName: string, lang: "tr" | "en"): string {
  if (lang !== "tr") return enName;
  const t = enName.trim().toLowerCase();
  const fromList = COUNTRIES.find((c) => c.en.toLowerCase() === t);
  if (fromList) return fromList.tr;
  return EXTRA_COUNTRY_TR[t] ?? enName;
}
