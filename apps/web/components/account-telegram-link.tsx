"use client";

import * as React from "react";
import { TelegramLoginButton } from "@/components/telegram-login";

export function AccountTelegramLink({
  botUsername,
}: {
  botUsername: string;
}) {
  const [status, setStatus] = React.useState<string>("");

  return (
    <>
      <TelegramLoginButton
        botUsername={botUsername}
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
