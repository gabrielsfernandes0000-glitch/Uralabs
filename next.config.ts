import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.postimg.cc" },
      { hostname: "cdn.discordapp.com" },
      { hostname: "media.discordapp.net" },
    ],
  },
  // Aliasa `lucide-react` → nosso shim Phosphor. Muda toda a plataforma de uma vez
  // sem precisar refactoring arquivo por arquivo. Props legadas do Lucide
  // (strokeWidth) são ignoradas silenciosamente pelo Phosphor.
  turbopack: {
    resolveAlias: {
      "lucide-react": "./src/lib/lucide-shim.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "lucide-react": path.resolve(__dirname, "src/lib/lucide-shim.ts"),
    };
    return config;
  },
  // Headers globais de segurança + cache. Aplicados a toda request.
  async headers() {
    // CSP permissivo em script-src (Next.js precisa de 'unsafe-inline' sem
    // nonce-based setup). O valor real vem da restrição de frame-ancestors
    // (anti-clickjacking) + object-src none + form-action self + base-uri self
    // + upgrade-insecure-requests. script-src whitelisting limita origem de
    // scripts externos (TradingView, Vercel Live) mesmo com 'unsafe-inline'.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com https://www.tradingview.com https://s.tradingview.com https://vercel.live https://*.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.binance.com https://open-api.bingx.com https://uralabs-bingx-proxy.gabriel-sfernandes0000.workers.dev https://worker-production-fee8.up.railway.app wss://worker-production-fee8.up.railway.app https://*.tradingview.com https://vitals.vercel-insights.com https://vercel.live wss://ws-us3.pusher.com",
      "frame-src 'self' https://www.tradingview.com https://s.tradingview.com https://vercel.live",
      "media-src 'self' https: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ];

    return [
      {
        source: "/cosmetics/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
