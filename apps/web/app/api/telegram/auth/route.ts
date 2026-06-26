import { NextRequest, NextResponse } from "next/server";
import { createHmac, createHash } from "crypto";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { TELEGRAM_BOT_TOKEN } from "@/lib/bot-config";
import { db, user } from "@aquaflow/database";

interface TelegramAuthPayload {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

function buildDataCheckString(payload: TelegramAuthPayload): string {
  const entries = Object.entries(payload)
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`);
  return entries.join("\n");
}

function verifyTelegramPayload(payload: TelegramAuthPayload): boolean {
  if (!TELEGRAM_BOT_TOKEN) return false;
  if (!payload.hash || typeof payload.auth_date !== "number") return false;

  const now = Math.floor(Date.now() / 1000);
  if (now - payload.auth_date > MAX_AUTH_AGE_SECONDS) return false;

  const secret = createHash("sha256").update(TELEGRAM_BOT_TOKEN).digest();
  const checkString = buildDataCheckString(payload);
  const hash = createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  return hash === payload.hash.toLowerCase();
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as TelegramAuthPayload;

  if (!verifyTelegramPayload(payload)) {
    return NextResponse.json(
      { success: false, message: "Недействительные данные Telegram" },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Сначала войдите или зарегистрируйтесь по email" },
      { status: 401 }
    );
  }

  try {
    const telegramId = String(payload.id);
    await db
      .update(user)
      .set({ telegramId })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true, telegramId });
  } catch (e) {
    console.error("[telegram-auth] link failed:", e);
    return NextResponse.json(
      { success: false, message: "Не удалось сохранить Telegram ID" },
      { status: 500 }
    );
  }
}
