import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker icin slim runtime — sadece gerekli node_modules + server.js
  output: "standalone",
  poweredByHeader: false,
  compress: false,
  reactStrictMode: true,
  // PERF/FCP+LCP: CSS'i ayrı render-engelleyen <link> yerine HTML <head>'ine
  // <style> olarak göm. Böylece ilk boyama, 33KB'lik CSS'in ağdan inmesini
  // BEKLEMEZ (PageSpeed "Oluşturma engelleme ~300ms" uyarısı kalkar).
  // Ödünleşim: HTML biraz büyür ve CSS sayfalar arası cache'lenmez — ama
  // nginx/Cloudflare yanıtı sıkıştırır, client-side gezinmelerde CSS zaten
  // yüklüdür; kazanan senaryo İLK yükleme (PageSpeed'in ölçtüğü) FCP/LCP.
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.scorestv.com" },
      { protocol: "https", hostname: "media.api-sports.io" },
    ],
  },
  // Güvenlik başlıkları (tüm yollar). CSP burada YOK — 3. taraf gömüler
  // (YouTube, Twitter, Google/Apple auth, analytics) nedeniyle ayrı, test
  // gerektiren bir pas. Bu başlıklar düşük riskli ve clickjacking/sniffing
  // gibi yaygın vektörleri kapatır.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
