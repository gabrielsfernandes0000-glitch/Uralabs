import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.postimg.cc" },
      { hostname: "cdn.discordapp.com" },
      { hostname: "media.discordapp.net" },
    ],
  },
};

export default nextConfig;
