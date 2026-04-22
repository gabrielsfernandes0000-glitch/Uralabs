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
  // Cache agressivo pros assets de cosméticos. Slug já é o identificador
  // (o conteúdo nunca muda pro mesmo slug) — pode deixar immutable 1 ano.
  async headers() {
    return [
      {
        source: "/cosmetics/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
