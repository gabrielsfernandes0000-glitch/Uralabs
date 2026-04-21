import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.postimg.cc" },
      { hostname: "cdn.discordapp.com" },
      { hostname: "media.discordapp.net" },
    ],
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
