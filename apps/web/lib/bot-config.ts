export const BOT_API_URL = process.env.BOT_API_URL ?? "http://127.0.0.1:8001";
export const BOT_API_TOKEN = process.env.BOT_API_TOKEN ?? "";
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
export const TELEGRAM_BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";

export const SHOW_TELEGRAM_LOGIN =
  process.env.NEXT_PUBLIC_SHOW_TELEGRAM_LOGIN === "true" &&
  Boolean(TELEGRAM_BOT_USERNAME);

export function botApiHeaders() {
  return {
    Authorization: `Bearer ${BOT_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export function hasBotApiCredentials(): boolean {
  return Boolean(BOT_API_URL && BOT_API_TOKEN);
}
