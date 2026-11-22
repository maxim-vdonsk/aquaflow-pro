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
  trustedOrigins: async (request: any) => {
    const origin = request?.headers?.get?.("origin") || "";
    const extra = (process.env.AUTH_EXTRA_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const ok = /\.lhr\.life$/.test(origin) || extra.includes(origin);
    return ok ? [origin] : [];
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
        returned: true,
        fieldName: "role",
      },
      phone: {
        type: "string",
        required: false,
        input: true,
        returned: true,
        fieldName: "phone",
      },
      clientId: {
        type: "string",
        required: false,
        input: false,
        returned: true,
        fieldName: "client_id",
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
    // Configure OAuth providers (Google/Yandex/etc.) here using env credentials.
  },
});

export type Session = typeof auth.$Infer.Session;
