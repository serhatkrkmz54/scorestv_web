import { headers, cookies } from "next/headers";
import type { Lang } from "@/i18n/auth-strings";

// Ulkeye gore varsayilan dil — Cloudflare CF-IPCountry. TR/AZ -> tr, digerleri -> en.
export function geoDefaultLang(country: string | null | undefined): Lang {
  const c = (country ?? "").toUpperCase();
  return c === "TR" || c === "AZ" ? "tr" : "en";
}

// Istek basina dili coz: kayitli tercih (cookie) > ulke > en.
export async function resolveLang(): Promise<Lang> {
  const [hdrs, cks] = await Promise.all([headers(), cookies()]);
  const saved = cks.get("stv_lang")?.value;
  return saved === "tr" || saved === "en"
    ? saved
    : geoDefaultLang(hdrs.get("cf-ipcountry"));
}
