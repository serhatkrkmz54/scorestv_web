import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker icin slim runtime — sadece gerekli node_modules + server.js paketlenir.
  // Build sonrasi: .next/standalone/  → 80-120MB image (full node_modules 500MB+).
  output: "standalone",

  // Production'da X-Powered-By header'i acmaz (security through obscurity).
  poweredByHeader: false,

  // Compression nginx katmaninda yapilir (gzip+brotli); Next'in JS gzip'i
  // duplike olmasin — kapat.
  compress: false,

  // Strict mode — React 19 davranisi production'da da deterministik kalsin.
  reactStrictMode: true,

  // External backend resimleri (logo/foto). Backend MinIO public URL'i +
  // direkt API-Football CDN'i icin remote pattern.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.scorestv.com" },
      { protocol: "https", hostname: "media.api-sports.io" },
    ],
  },
};

export default nextConfig;
