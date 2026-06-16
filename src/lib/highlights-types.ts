/** Backend HighlightView TS karşılığı (maç özeti/highlight). */
export interface Highlight {
  id: number;
  title: string;
  url: string;
  embedUrl?: string | null;
  imgUrl?: string | null;
  source?: string | null;
  type?: string | null; // VERIFIED | UNVERIFIED
  /** embedUrl uygulama içinde gömülebilir mi (ücretli plan geo-restrictions). */
  embeddable?: boolean;
  blockedCountries?: string[];
}
