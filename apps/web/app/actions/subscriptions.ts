"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, subscriptions, products } from "@aquaflow/database";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const FREQUENCIES = ["weekly", "biweekly", "monthly"] as const;
const FREQ_LABELS: Record<(typeof FREQUENCIES)[number], string> = {
  weekly: "раз в неделю",
  biweekly: "раз в 2 недели",
  monthly: "раз в месяц",
};

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  const id = session?.user?.id;
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}

export async function addSubscription(formData: FormData): Promise<void> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return;
  }

  const productId = String(formData.get("productId") ?? "");
  const frequency = String(formData.get("frequency") ?? "") as (typeof FREQUENCIES)[number];
  const nextDelivery = String(formData.get("nextDeliveryAt") ?? "");
  if (!productId || !FREQUENCIES.includes(frequency) || !nextDelivery) return;

  const nextDeliveryDate = new Date(nextDelivery);
  if (Number.isNaN(nextDeliveryDate.getTime()) || nextDeliveryDate.getTime() < Date.now()) return;

  // Only an existing catalog product can be subscribed to (FK would reject
  // a bogus uuid anyway, but fail fast and quietly here).
  const product = (
    await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1)
  )[0];
  if (!product) return;

  try {
    await db.insert(subscriptions).values({
      userId,
      productId,
      frequency,
      nextDeliveryAt: nextDeliveryDate,
      active: true,
    });
  } catch (e) {
    console.error("[subscriptions] addSubscription failed:", e);
  }
  revalidatePath("/account");
}

export async function cancelSubscription(formData: FormData): Promise<void> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return;
  }
  const id = String(formData.get("subscriptionId") ?? "");
  if (!id) return;
  try {
    await db
      .update(subscriptions)
      .set({ active: false })
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)));
  } catch (e) {
    console.error("[subscriptions] cancelSubscription failed:", e);
  }
  revalidatePath("/account");
}