import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  output: "standalone",
  env: {
    BOT_API_URL: process.env.BOT_API_URL,
    BOT_API_TOKEN: process.env.BOT_API_TOKEN,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "**.vercel.app" },
    ],
  },
};

export default nextConfig;
