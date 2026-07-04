import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker icin slim runtime — sadece gerekli node_modules + server.js
  output: "standalone",
  poweredByHeader: false,
  compress: false,
  reactStrictMode: true,
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
