"use client";

import * as React from "react";
import { TelegramLoginButton } from "@/components/telegram-login";

export function AccountTelegramLink() {
  const [status, setStatus] = React.useState<string>("");

  return (
    <>
      <TelegramLoginButton
        onLinked={() => {
          setStatus("Telegram привязан. Обновите страницу, чтобы увидеть изменения.");
        }}
        onError={(msg) => setStatus(msg)}
      />
      {status && (
        <p className="text-xs text-[var(--color-muted-foreground)]">{status}</p>
      )}
    </>
  );
}
