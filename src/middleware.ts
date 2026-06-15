import { NextResponse, type NextRequest } from "next/server";

// Dil artik her ulke icin VARSAYILAN olarak Ingilizce'dir. Onceki "Turkiye ->
// Turkce" otomatik (CF-IPCountry) secimi kaldirildi. Kullanici TR/EN toggle'ina
// basinca tercih localStorage + cookie'ye yazilir ve korunur.
//
// Bu middleware artik dil icin bir sey yapmiyor; baska bir amac gerekmiyorsa
// dosya tamamen silinebilir (PowerShell: Remove-Item src\middleware.ts).
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // API, statik dosyalar ve next içsel yollarını atla.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
