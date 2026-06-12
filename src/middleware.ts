import { NextResponse, type NextRequest } from "next/server";

// Ziyaretçinin ülkesine göre VARSAYILAN dili belirler (yalnızca ilk ziyarette,
// kullanıcı henüz dil seçmemişse). Cloudflare arkasında CF-IPCountry header'ı
// kesin ülke kodunu verir: Türkiye → tr, diğer tüm ülkeler → en.
//
// CF header yoksa (örn. local geliştirme) hiçbir şey yapılmaz; uygulama kendi
// varsayılanına (tr) düşer. Kullanıcı TR/EN toggle'ına basınca cookie güncellenir
// ve bu otomatik mantık devre dışı kalır.
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const country = req.headers.get("cf-ipcountry");
  if (country && !req.cookies.get("stv_lang")) {
    const lang = country.toUpperCase() === "TR" ? "tr" : "en";
    res.cookies.set("stv_lang", lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 yıl
      sameSite: "lax",
    });
  }

  return res;
}

export const config = {
  // API, statik dosyalar ve next içsel yollarını atla.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
