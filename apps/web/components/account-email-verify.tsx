"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function AccountEmailVerify({ email }: { email: string }) {
  const [state, setState] = React.useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  const handleClick = async () => {
    setState("loading");
    try {
      const res = await authClient.sendVerificationEmail({ email });
      if (res.error) throw new Error(res.error.message || "Ошибка");
      setState("sent");
    } catch (e: any) {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <p className="text-sm text-emerald-400">
        Письмо отправлено. Проверьте почту и перейдите по ссылке.
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={state === "loading"}
    >
      {state === "loading" ? "Отправка..." : "Подтвердить email"}
    </Button>
  );
}
