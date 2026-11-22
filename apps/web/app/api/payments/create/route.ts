// API для MAX-бота: создание платежа по заявке бота.
// Аутентификация: Bearer BOT_API_TOKEN (тот же внутренний токен, что у моста).
// Бот НЕ держит ключи ЮKassa — сайт — единственная точка с секретами и режимом
// (fake/test/live), бот проходит всегда через сайт. Это позволяет позже
// добавить другого провайдера, не трогая бота.

import { NextResponse } from "next/server";
import { BOT_API_TOKEN } from "@/lib/bot-config";
import { createPayment, type YkReceiptItem } from "@/lib/yookassa";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  if (!BOT_API_TOKEN) {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  }
  const auth = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!auth || auth !== BOT_API_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: {
    source?: string;
    order_ref?: number;
    client_id?: number;
    amount_cents?: number;
    description?: string;
    customer_contact?: string | null;
    items?: Array<{ name: string; quantity: number; price_rub: number }>;
  };
  body = await request.json().catch(() => null);
  if (!body || typeof body.client_id !== "number" || typeof body.amount_cents !== "number") {
    return NextResponse.json({ ok: false, error: "bad body" }, { status: 400 });
  }
  if (body.amount_cents < 100 || body.amount_cents > 1_000_000_00) {
    return NextResponse.json({ ok: false, error: "bad amount" }, { status: 400 });
  }

  const meta = {
    source: "max_bot",
    order_ref: String(body.order_ref ?? ""),
    client_id: String(body.client_id),
  };

  const items: YkReceiptItem[] = (body.items ?? []).slice(0, 20).map((it) => ({
    name: String(it.name ?? "Вода").slice(0, 128),
    quantity: Math.max(1, Number(it.quantity) || 1),
    priceCents: Math.round(Number(it.price_rub) * 100),
  }));

  try {
    const payment = await createPayment({
      orderUuid: `bot-${meta.order_ref}-${meta.client_id}`,
      amountCents: body.amount_cents,
      description: String(body.description ?? "Доставка воды").slice(0, 128),
      returnUrl: `${APP_URL}/`,
      customerContact: body.customer_contact ?? null,
      receiptItems: items.length ? items : undefined,
      extraMetadata: meta,
    });
    return NextResponse.json({
      ok: true,
      payment_id: payment.id,
      confirmation_url: payment.confirmationUrl,
    });
  } catch (err) {
    console.error("[payments/create] createPayment failed:", err);
    return NextResponse.json({ ok: false, error: "upstream error" }, { status: 502 });
  }
}
