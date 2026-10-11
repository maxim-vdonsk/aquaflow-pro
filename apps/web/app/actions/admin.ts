"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, user } from "@aquaflow/database";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export interface ActionResult {
  ok: boolean;
  message: string;
}

async function assertAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") throw new Error("FORBIDDEN");
  return true;
}

async function adminRoleCount(excludeUserId?: string): Promise<number> {
  const rows = await db
    .select({ admins: sql<number>`count(*)::int` })
    .from(user)
    .where(
      excludeUserId
        ? sql`${user.role} = 'admin' and ${user.id} <> ${excludeUserId}`
        : eq(user.role, "admin"),
    );
  return rows[0]?.admins ?? 0;
}

/** Promote/demote between admin and customer for an existing site user. */
export async function setUserRole(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, message: "Недостаточно прав" };
  }

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId) return { ok: false, message: "Не указан пользователь" };
  if (role !== "admin" && role !== "customer") {
    return { ok: false, message: "Некорректная роль" };
  }

  const rows = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const target = rows[0];
  if (!target) return { ok: false, message: "Пользователь не найден" };
  if (target.role === role) {
    return { ok: true, message: "Роль уже такая — менять нечего" };
  }

  // Never allow removing the last admin.
  if (target.role === "admin" && role !== "admin") {
    const others = await adminRoleCount(userId);
    if (others < 1) {
      return { ok: false, message: "Нельзя снять последнего администратора" };
    }
  }

  await db.update(user).set({ role }).where(eq(user.id, userId));
  revalidatePath("/admin");
  revalidatePath("/account");
  return { ok: true, message: "Готово" };
}

/** Assign the admin role to an existing site user by email. */
export async function assignAdminByEmail(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, message: "Недостаточно прав" };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, message: "Некорректный email" };
  }

  const rows = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  const target = rows[0];
  if (!target) {
    return { ok: false, message: "Пользователь с таким email не зарегистрирован на сайте" };
  }
  if (target.role === "admin") {
    return { ok: false, message: "Этот пользователь уже админ" };
  }

  await db.update(user).set({ role: "admin" }).where(eq(user.id, target.id));
  revalidatePath("/admin");
  revalidatePath("/account");
  return { ok: true, message: `${email} теперь админ` };
}