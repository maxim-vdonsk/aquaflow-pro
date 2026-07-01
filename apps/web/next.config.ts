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
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    NEXT_PUBLIC_SHOW_TELEGRAM_LOGIN: process.env.NEXT_PUBLIC_SHOW_TELEGRAM_LOGIN,
  },
  publicRuntimeConfig: {
    showTelegramLogin: process.env.NEXT_PUBLIC_SHOW_TELEGRAM_LOGIN === "true",
    telegramBotUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
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
