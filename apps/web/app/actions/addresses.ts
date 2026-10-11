"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, addresses } from "@aquaflow/database";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  const id = session?.user?.id;
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}

export async function addAddress(formData: FormData): Promise<void> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return;
  }

  const city = String(formData.get("city") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  if (!city || !street) return;
  const opt = (key: string) => String(formData.get(key) ?? "").trim() || null;

  try {
    await db.insert(addresses).values({
      userId,
      city,
      street,
      apartment: opt("apartment"),
      entrance: opt("entrance"),
      floor: opt("floor"),
      comment: opt("comment"),
      isDefault: formData.get("isDefault") === "on",
    });
  } catch (e) {
    console.error("[addresses] addAddress failed:", e);
  }
  revalidatePath("/account");
}

export async function deleteAddress(formData: FormData): Promise<void> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return;
  }
  const id = String(formData.get("addressId") ?? "");
  if (!id) return;
  try {
    // Ownership is enforced by userId — never delete someone else's row.
    await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  } catch (e) {
    console.error("[addresses] deleteAddress failed:", e);
  }
  revalidatePath("/account");
}