import { db, user } from "./db";
import { eq } from "drizzle-orm";

/**
 * Создаёт администратора через Better Auth API и повышает роль до admin.
 * Использование:
 *   BASE_URL=http://localhost:3000 ADMIN_EMAIL=admin@aquaflow.local ADMIN_PASSWORD=superpass ADMIN_NAME=Admin node --loader ts-node/esm src/create-admin.ts
 *
 * Или через tsx (установлен в package.json):
 *   pnpm tsx src/create-admin.ts
 */

async function main() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const email = process.env.ADMIN_EMAIL || "admin@aquaflow.local";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Администратор";

  if (!password) {
    console.error("ADMIN_PASSWORD is required");
    process.exit(1);
  }

  // 1. Регистрация через Better Auth API.
  const signUpRes = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  let signUpData: any;
  try {
    signUpData = await signUpRes.json();
  } catch {
    signUpData = {};
  }

  if (!signUpRes.ok && signUpData?.code !== "EMAIL_ALREADY_EXISTS") {
    console.error("Sign up failed:", signUpRes.status, signUpData);
    process.exit(1);
  }

  // 2. Повышаем роль до admin.
  const [updated] = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id, email: user.email, role: user.role });

  if (!updated) {
    console.error("User not found after sign up");
    process.exit(1);
  }

  console.log("Admin created/updated:", updated);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
