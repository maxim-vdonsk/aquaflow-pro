"use server";

// Платёжные server actions (ЮKassa): старт онлайн-оплаты и возврат из админки.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db, orders, orderItems } from "@aquaflow/database";
import { eq } from "drizzle-orm";
import {
  createPayment,
  createRefund,
  getPayment,
  yookassaMode,
  type YkReceiptItem,
} from "@/lib/yookassa";
import { getCatalogProducts } from "@/lib/catalog";
import { products as staticProducts } from "@/lib/data";
import { centsToRub } from "@/lib/order-view";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function namesFor(
  items: { productId: string }[],
  catalog: Awaited<ReturnType<typeof getCatalogProducts>>
): Map<string, string> {
  const names = new Map(catalog.map((p) => [p.id, p.name]));
  for (const p of staticProducts) {
    if (!names.has(p.id)) names.set(p.id, p.name);
  }
  const out = new Map<string, string>();
  for (const it of items) out.set(it.productId, names.get(it.productId) ?? it.productId);
  return out;
}

export async function startOnlinePayment(orderId: string): Promise<{
  success: boolean;
  confirmationUrl?: string;
  message?: string;
}> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { success: false, message: "Заказ не найден" };
  if (order.paymentStatus !== "pending") {
    return { success: true, message: "Оплата уже обработана" };
  }

  // Идемпотентно: если платёж уже был создан, переиспользуем его ссылку.
  if (order.paymentId) {
    const existing = await getPayment(order.paymentId);
    if (existing && (existing.status === "pending" || existing.status === "waiting_for_capture")) {
      if (existing.confirmationUrl) return { success: true, confirmationUrl: existing.confirmationUrl };
    } else if (existing && existing.status === "succeeded") {
      await db.update(orders).set({ paymentStatus: "paid" }).where(eq(orders.id, orderId));
      return { success: true, message: "Заказ уже оплачен" };
    }
  }

  const items = await db
    .select({ productId: orderItems.productId, quantity: orderItems.quantity, price: orderItems.price })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  let receiptItems: YkReceiptItem[] | undefined;
  let customerContact: string | null = null;
  if (yookassaMode() !== "fake") {
    const catalog = await getCatalogProducts();
    const names = namesFor(items, catalog);
    receiptItems = items.map((it) => ({
      name: names.get(it.productId) ?? it.productId,
      quantity: it.quantity,
      priceCents: it.price,
    }));
    customerContact = order.contactPhone ?? null;
  }

  const payment = await createPayment({
    orderUuid: order.id,
    amountCents: order.total,
    description: `Доставка воды, заказ №${order.id.slice(0, 8)}`,
    returnUrl: `${APP_URL}/pay/result?order_id=${order.id}`,
    customerContact,
    receiptItems,
  });

  await db.update(orders).set({ paymentId: payment.id }).where(eq(orders.id, orderId));

  if (!payment.confirmationUrl) {
    return { success: false, message: "Платёжная платформа не вернула ссылку на оплату" };
  }
  return { success: true, confirmationUrl: payment.confirmationUrl };
}

export async function refundOrder(orderId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "operator") {
    return { success: false, message: "Нет прав" };
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { success: false, message: "Заказ не найден" };
  if (order.paymentStatus !== "paid" || !order.paymentId) {
    return { success: false, message: "Возврат возможен только для оплаченных заказов" };
  }

  const refund = await createRefund(order.paymentId, order.total, `refund-${order.id}`);
  if (refund.status !== "succeeded" && refund.status !== "pending") {
    return { success: false, message: `Возврат не принят: ${refund.status}` };
  }
  await db
    .update(orders)
    .set({ paymentStatus: "refunded" })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin");
  revalidatePath("/account");
  return {
    success: true,
    message: `Возврат ${centsToRub(order.total)} создан (${refund.status})`,
  };
}
