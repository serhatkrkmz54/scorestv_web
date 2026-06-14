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
};

export default nextConfig;
