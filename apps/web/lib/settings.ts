// Runtime-флаги сайта (админ-тумблер онлайн-оплаты).
import { db, settings } from "@aquaflow/database";
import { eq } from "drizzle-orm";

export const PAYMENTS_ON_KEY = "payments_on";

export async function isPaymentsEnabled(): Promise<boolean> {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, PAYMENTS_ON_KEY))
    .limit(1);
  // Отсутствие записи = включено (default).
  if (!row) return true;
  return row.value === "1";
}

export async function setPaymentsEnabled(on: boolean): Promise<void> {
  await db
    .insert(settings)
    .values({ key: PAYMENTS_ON_KEY, value: on ? "1" : "0" })
    .onConflictDoUpdate({ target: settings.key, set: { value: on ? "1" : "0" } });
}
