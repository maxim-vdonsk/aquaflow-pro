"use server";

import {
  BOT_API_URL,
  botApiHeaders,
  hasBotApiCredentials,
} from "@/lib/bot-config";

export { hasBotApiCredentials };

export interface BotWaterItem {
  water_type: string;
  name: string;
  price: number;
  image?: string | null;
  visible: boolean;
}

export interface BotOrderInput {
  telegram_id: number;
  data_delivery: string;
  client_name: string;
  client_address: string;
  number: string;
  water_type: string;
  bottles: number;
  apartment?: string;
  floor?: string;
  district?: string;
}

export interface BotOrderResult {
  ok: boolean;
  data?: {
    id: number;
    telegram_id: number;
    data_delivery: string;
    client_name: string;
    client_address: string;
    apartment?: string | null;
    floor?: string | null;
    number: string;
    water_type: string;
    bottles: number;
  };
  error?: string;
}

// --- multi-item site order (cart) ---
export interface SiteOrderItemInput {
  name: string;
  quantity: number;
  price: number; // rubles
  category: string;
  water_type?: string;
}

export interface SiteOrderBotInput {
  telegram_id: number;
  data_delivery: string;
  client_name: string;
  client_address: string;
  number: string;
  apartment?: string;
  floor?: string;
  comment?: string;
  items: SiteOrderItemInput[];
}

export interface SiteOrderBotResult {
  ok: boolean;
  notified?: number;
  total?: number;
  error?: string;
}

export async function fetchBotWater(): Promise<BotWaterItem[]> {
  if (!hasBotApiCredentials()) return [];

  try {
    const res = await fetch(`${BOT_API_URL}/api/water?include_hidden=0`, {
      method: "GET",
      headers: botApiHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[bot-api] fetch water failed:", res.status, await res.text());
      return [];
    }
    return (await res.json()) as BotWaterItem[];
  } catch (e) {
    console.error("[bot-api] fetch water error:", e);
    return [];
  }
}

export async function submitOrderToBot(input: BotOrderInput): Promise<BotOrderResult> {
  if (!hasBotApiCredentials()) {
    return { ok: false, error: "Bot API not configured" };
  }

  try {
    const res = await fetch(`${BOT_API_URL}/api/orders`, {
      method: "POST",
      headers: botApiHeaders(),
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[bot-api] submit order failed:", res.status, text);
      return { ok: false, error: `Bot API ${res.status}: ${text}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    console.error("[bot-api] submit order error:", e);
    return { ok: false, error: String(e) };
  }
}

// Send a multi-item cart to the bot as a single request. The bot composes one
// TG message to managers with the full item list + total. Best-effort: the
// caller must persist the order to the site DB regardless of this result.
export async function submitSiteOrderToBot(
  input: SiteOrderBotInput
): Promise<SiteOrderBotResult> {
  if (!hasBotApiCredentials()) {
    return { ok: false, error: "Bot API not configured" };
  }

  try {
    const res = await fetch(`${BOT_API_URL}/api/site-order`, {
      method: "POST",
      headers: botApiHeaders(),
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[bot-api] submit site-order failed:", res.status, text);
      return { ok: false, error: `Bot API ${res.status}: ${text}` };
    }
    return (await res.json()) as SiteOrderBotResult;
  } catch (e) {
    console.error("[bot-api] submit site-order error:", e);
    return { ok: false, error: String(e) };
  }
}