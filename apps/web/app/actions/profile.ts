"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, user } from "@aquaflow/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

function validatePhone(phone: string): boolean {
  return /^\+?[\d\s()-]{10,}$/.test(phone);
}

export async function updatePhone(formData: FormData): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  const phone = formData.get("phone")?.toString().trim() ?? "";
  if (!validatePhone(phone)) return;

  try {
    await db.update(user).set({ phone }).where(eq(user.id, userId));
    revalidatePath("/account");
  } catch (e) {
    console.error("[profile] updatePhone failed:", e);
  }
}

export async function setPhone(phone: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  if (!validatePhone(phone)) return;

  try {
    await db.update(user).set({ phone }).where(eq(user.id, userId));
    revalidatePath("/account");
  } catch (e) {
    console.error("[profile] setPhone failed:", e);
  }
}
