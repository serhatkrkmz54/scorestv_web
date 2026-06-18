import type { Metadata } from "next";

/// Minimal tam-ekran YouTube oynatıcı sayfası.
///
/// Mobil uygulama maç özetlerinde bu sayfayı uygulama içi WebView'de açar.
/// Sayfa scorestv.com origin'inden (gerçek ağ sayfası) servis edildiği için
/// YouTube iframe'i doğru Referer/origin alır ve bare WebView'de görülen
/// "Oynatıcı yapılandırma hatası" (error 150/152/153) oluşmaz — web'deki
/// çalışan davranışın birebir aynısı.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "ScoresTV — Özet",
};

export default async function YoutubeEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Güvenlik: yalnız geçerli YouTube ID karakterleri (11 karakter).
  const safe = /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
  const src = safe
    ? `https://www.youtube.com/embed/${safe}?autoplay=1&playsinline=1&rel=0&modestbranding=1`
    : "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
      }}
    >
      {src ? (
        <iframe
          src={src}
          title="ScoresTV özet"
          style={{ border: 0, width: "100%", height: "100%" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}
    </div>
  );
}
