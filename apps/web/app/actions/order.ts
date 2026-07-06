"use server";

import { headers } from "next/headers";
import { db, orders, orderItems } from "@aquaflow/database";
import { orderSchema } from "@/lib/schema";
import { auth } from "@/lib/auth";
import {
  fetchBotWater,
  submitOrderToBot,
  hasBotApiCredentials,
  type BotOrderInput,
} from "@/lib/bot-api";
import { findWaterTypeForProduct } from "@/lib/bot-water-map";
import { getCatalogProducts } from "@/lib/catalog";
import { products as staticProducts } from "@/lib/data";

function phoneToSyntheticTelegramId(phone: string): number {
  // Stable negative hash of the phone number. Negative values avoid collisions
  // with real Telegram user IDs which are always positive.
  const digits = phone.replace(/\D/g, "");
  let hash = 0;
  for (let i = 0; i < digits.length; i++) {
    hash = ((hash << 5) - hash + digits.charCodeAt(i)) | 0;
  }
  return hash ? -Math.abs(hash) : -1;
}

export async function createOrder(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = orderSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Проверьте поля формы",
    };
  }

  const {
    name,
    phone,
    address,
    apartment,
    floor,
    productId,
    quantity,
    scheduledAt,
  } = parsed.data;

  const catalog = await getCatalogProducts();
  const product =
    catalog.find((p) => p.id === productId || p.slug === productId) ||
    catalog.find((p) =>
      p.name.toLowerCase().includes(productId.toLowerCase())
    );
  if (!product) {
    return { success: false, message: "Продукт не найден" };
  }

  const staticProduct =
    staticProducts.find((p) => p.slug === product.slug || p.id === product.id) ||
    staticProducts.find((p) => p.category === product.category);

  const session = await auth.api.getSession({ headers: await headers() });
  const userTelegramId = session?.user?.telegramId;
  const telegramId = userTelegramId
    ? Number(userTelegramId)
    : phoneToSyntheticTelegramId(phone);

  const total = product.price * quantity;

  // 1. Persist order to the site DB first — this is the source of truth.
  //    Bot forwarding below is best-effort and must NEVER block order creation,
  //    so a bot outage does not lose the order.
  let savedOrderId: string;
  let demo = false;
  try {
    const scheduledDate = new Date(scheduledAt);

    const [order] = await db
      .insert(orders)
      .values({
        userId: session?.user?.id ?? "guest",
        status: "pending",
        total,
        scheduledAt: scheduledDate,
        paymentStatus: "pending",
      })
      .returning({ id: orders.id });

    await db.insert(orderItems).values({
      orderId: order.id,
      productId: staticProduct?.id ?? product.id,
      quantity,
      price: product.price,
    });

    savedOrderId = order.id;
  } catch (err) {
    console.error("Order DB insert failed (demo mode):", err);
    savedOrderId = `demo-${Math.random().toString(36).slice(2, 10)}`;
    demo = true;
  }

  // 2. Forward water orders to the Telegram bot API (best-effort).
  //    The order is already saved above; a bot failure is logged but does not
  //    surface to the customer.
  if (!demo && hasBotApiCredentials() && product.category === "water") {
    try {
      const botWater = await fetchBotWater();
      const waterType = findWaterTypeForProduct(productId, botWater);
      if (waterType) {
        const botOrder: BotOrderInput = {
          telegram_id: telegramId,
          data_delivery: scheduledAt,
          client_name: name,
          client_address: address,
          number: phone,
          water_type: waterType,
          bottles: quantity,
          apartment: apartment || undefined,
          floor: floor || undefined,
          district: undefined,
        };
        const botResult = await submitOrderToBot(botOrder);
        if (!botResult.ok) {
          console.error(
            "[order] bot forward failed (order still saved):",
            botResult.error
          );
        }
      }
    } catch (e) {
      console.error("[order] bot forward threw (order still saved):", e);
    }
  }

  const orderLabel = savedOrderId.slice(0, 8);
  const message = demo
    ? `Демо-заказ №${orderLabel} принят. В production он будет сохранён в базе сайта.`
    : `Заказ №${orderLabel} создан. Мы свяжемся с вами по телефону ${phone}.`;

  return {
    success: true,
    orderId: savedOrderId,
    demo,
    message,
  };
}