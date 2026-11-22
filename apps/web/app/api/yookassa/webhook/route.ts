// Входящий webhook ЮKassa (HTTP-уведомления). Настройка в ЛК ЮKassa:
// Интеграция → HTTP-уведомления → URL https://<домен>/api/yookassa/webhook,
// события: payment.succeeded, payment.canceled, refund.succeeded.
// Правило ЮKassa: уведомление не является подтверждением — статус всегда
// перепроверяется запросом GET /v3/payments/{id} (в fake-режиме — по нашей БД).
// Требование ответа: HTTP 200, иначе ЮKassa ретраит доставку 24 часа.

import { NextResponse } from "next/server";
import { db, orders } from "@aquaflow/database";
import { eq } from "drizzle-orm";
import { getPayment } from "@/lib/yookassa";

// Официальные IP-адреса уведомлений ЮKassa (документация, developers/using-api/webhooks).
const ALLOWED_V4_CIDR = [
  "185.71.76.0/27",
  "185.71.77.0/27",
  "77.75.153.0/25",
  "77.75.154.128/25",
];
const ALLOWED_V4_EXACT = new Set(["77.75.156.11", "77.75.156.35"]);
const ALLOWED_V6_PREFIX = "2a02:5180:";

function ipToLong(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let long = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    long = (long << 8) | n;
  }
  return long >>> 0;
}

function ipAllowed(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
    // Локальные вызовы допускаются только в fake-режиме (эмулятор кассы).
    return process.env.YOOKASSA_MODE === "fake";
  }
  if (ip.startsWith(ALLOWED_V6_PREFIX)) return true;
  if (ALLOWED_V4_EXACT.has(ip)) return true;
  const long = ipToLong(ip);
  if (long === null) return false;
  for (const cidr of ALLOWED_V4_CIDR) {
    const [net, maskStr] = cidr.split("/");
    const mask = Number(maskStr);
    const netLong = ipToLong(net);
    if (netLong === null) continue;
    if ((netLong >> (32 - mask)) === (long >> (32 - mask))) return true;
  }
  return false;
}

function senderIp(headers: Headers): string {
  // Caddy проксирует: реальный клиент — первый x-forwarded-for.
  const fwd = (headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (fwd) return fwd;
  return headers.get("x-real-ip") || "";
}

export async function POST(request: Request) {
  const ip = senderIp(request.headers);
  if (!ipAllowed(ip)) {
    console.warn("[yookassa] webhook from unknown IP:", ip);
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let payload: {
    type?: string;
    event?: string;
    object?: { id?: string; status?: string; payment_id?: string };
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const objectId = payload.object?.id;
  if (payload.type !== "notification" || !objectId) {
    return NextResponse.json({ error: "unsupported" }, { status: 400 });
  }

  // refund.succeeded: object — возврат, payment_id указывает на платёж.
  if (payload.event === "refund.succeeded") {
    const refundPaymentId = payload.object?.payment_id;
    if (refundPaymentId) {
      await db
        .update(orders)
        .set({ paymentStatus: "refunded" })
        .where(eq(orders.paymentId, refundPaymentId));
    }
    return NextResponse.json({ ok: true, event: "refund.succeeded" });
  }

  let target: "paid" | "failed" | null = null;
  if (process.env.YOOKASSA_MODE === "fake") {
    // В fake-режиме авторитетный источник — уведомление эмулятора (как касса
    // в реальности): перечитывать неоткуда, кроме уведомления.
    const st = payload.object?.status ?? null;
    target = st === "succeeded" ? "paid" : st === "canceled" ? "failed" : null;
  } else {
    // Уведомление не является подтверждением: статус всегда перепроверяем
    // запросом GET /v3/payments/{id} (требование ЮKassa). Ошибка API (404 и
    // т.п.) — не сбой обработки: 200 без изменений, чтобы не зациклить ретраи.
    let payment;
    try {
      payment = await getPayment(objectId);
    } catch (err) {
      console.error("[yookassa] webhook verify failed:", err);
      return NextResponse.json({ ok: true, matched: false });
    }
    if (!payment) {
      return NextResponse.json({ ok: true, matched: false });
    }
    target =
      payment.status === "succeeded"
        ? "paid"
        : payment.status === "canceled"
          ? "failed"
          : null;
  }

  if (target) {
    // refunded не перезаписываем: webhook ставит только paid/failed;
    // возврат завершается refundOrder (или refund.succeeded выше).
    await db
      .update(orders)
      .set({ paymentStatus: target })
      .where(eq(orders.paymentId, objectId));
  }
  return NextResponse.json({ ok: true });
}
