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
