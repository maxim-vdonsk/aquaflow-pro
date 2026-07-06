"use server";

import { headers } from "next/headers";
import { db, orders, orderItems } from "@aquaflow/database";
import { auth } from "@/lib/auth";
import {
  submitSiteOrderToBot,
  hasBotApiCredentials,
  type SiteOrderItemInput,
} from "@/lib/bot-api";
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

interface CartLine {
  productId: string;
  quantity: number;
}

export async function createOrder(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const address = String(formData.get("address") ?? "");
  const apartment = String(formData.get("apartment") ?? "") || undefined;
  const floor = String(formData.get("floor") ?? "") || undefined;
  const scheduledAt = String(formData.get("scheduledAt") ?? "");
  const comment = String(formData.get("comment") ?? "") || undefined;

  // Cart lines arrive as a JSON-encoded array (order page cart) OR, for the
  // legacy single-product hero form, as productId + quantity fields.
  let cartLines: CartLine[] = [];
  const itemsRaw = formData.get("items");
  if (typeof itemsRaw === "string" && itemsRaw.trim()) {
    try {
      const parsed = JSON.parse(itemsRaw) as CartLine[];
      if (Array.isArray(parsed)) cartLines = parsed;
    } catch {
      return { success: false, message: "Некорректный состав корзины" };
    }
  } else {
    const productId = String(formData.get("productId") ?? "");
    const quantity = Number(formData.get("quantity") ?? 0);
    if (productId && quantity > 0) {
      cartLines = [{ productId, quantity }];
    }
  }

  // --- basic validation ---
  if (name.trim().length < 2) return { success: false, message: "Укажите имя" };
  if (!/^\+?[\d\s()-]{10,}$/.test(phone))
    return { success: false, message: "Введите корректный телефон" };
  if (address.trim().length < 5)
    return { success: false, message: "Укажите адрес доставки" };
  if (!scheduledAt) return { success: false, message: "Выберите дату доставки" };
  if (cartLines.length === 0)
    return { success: false, message: "Добавьте хотя бы один товар" };
  for (const line of cartLines) {
    if (!line.productId || line.quantity < 1 || line.quantity > 50)
      return { success: false, message: "Проверьте количество товаров" };
  }

  const catalog = await getCatalogProducts();
  const resolveProduct = (idOrSlug: string) =>
    catalog.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ||
    catalog.find((p) => p.name.toLowerCase().includes(idOrSlug.toLowerCase()));

  const resolved = cartLines
    .map((line) => {
      const product = resolveProduct(line.productId);
      if (!product) return null;
      return { product, quantity: line.quantity };
    })
    .filter((x): x is { product: NonNullable<ReturnType<typeof resolveProduct>>; quantity: number } => x !== null);

  if (resolved.length === 0) {
    return { success: false, message: "Продукты не найдены" };
  }

  const total = resolved.reduce(
    (sum, it) => sum + it.product.price * it.quantity,
    0
  );

  const session = await auth.api.getSession({ headers: await headers() });
  const userTelegramId = session?.user?.telegramId;
  const telegramId = userTelegramId
    ? Number(userTelegramId)
    : phoneToSyntheticTelegramId(phone);

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

    for (const it of resolved) {
      const staticProduct =
        staticProducts.find(
          (p) => p.slug === it.product.slug || p.id === it.product.id
        ) || null;
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: staticProduct?.id ?? it.product.id,
        quantity: it.quantity,
        price: it.product.price,
      });
    }

    savedOrderId = order.id;
  } catch (err) {
    console.error("Order DB insert failed (demo mode):", err);
    savedOrderId = `demo-${Math.random().toString(36).slice(2, 10)}`;
    demo = true;
  }

  // 2. Forward the full cart to the Telegram bot API (best-effort, any category).
  //    One request → one TG message to managers with all items + total.
  //    The order is already saved above; a bot failure is logged but does not
  //    surface to the customer.
  if (!demo && hasBotApiCredentials()) {
    try {
      const botItems: SiteOrderItemInput[] = resolved.map((it) => ({
        name: it.product.name,
        quantity: it.quantity,
        price: Math.round(it.product.price / 100), // cents → rubles
        category: it.product.category,
        water_type: it.product.water_type,
      }));
      const botResult = await submitSiteOrderToBot({
        telegram_id: telegramId,
        data_delivery: scheduledAt,
        client_name: name,
        client_address: address,
        number: phone,
        apartment,
        floor,
        comment,
        items: botItems,
      });
      if (!botResult.ok) {
        console.error(
          "[order] bot forward failed (order still saved):",
          botResult.error
        );
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