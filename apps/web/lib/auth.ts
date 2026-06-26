import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, user, session, account, verification } from "@aquaflow/database";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
    usePlural: false,
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
        returned: true,
        fieldName: "phone",
      },
      telegramId: {
        type: "string",
        required: false,
        input: false,
        returned: true,
        fieldName: "telegram_id",
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // Production TODO: replace with real SMTP provider (Resend/SendGrid/self-hosted).
      console.log(
        `[email-verification] ${user.email} token=${token} url=${url}`
      );
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
  },
  socialProviders: {
    // Configure Telegram, Google, Yandex OAuth here using env credentials.
  },
});

export type Session = typeof auth.$Infer.Session;
