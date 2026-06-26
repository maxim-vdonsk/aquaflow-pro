"use client";

import * as React from "react";
import {
  SHOW_TELEGRAM_LOGIN,
  TELEGRAM_BOT_USERNAME,
} from "@/lib/bot-config";

export interface TelegramAuthUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  className?: string;
  onLinked?: () => void;
  onError?: (message: string) => void;
}

export function TelegramLoginButton({
  className,
  onLinked,
  onError,
}: TelegramLoginButtonProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const callbackName = React.useRef(
    `onTelegramAuth_${React.useId().replace(/:/g, "")}`
  ).current;

  React.useEffect(() => {
    if (
      !SHOW_TELEGRAM_LOGIN ||
      !TELEGRAM_BOT_USERNAME ||
      !containerRef.current ||
      containerRef.current.childNodes.length > 0
    ) {
      return;
    }

    const handleAuth = async (tgUser: TelegramAuthUser) => {
      try {
        const res = await fetch("/api/telegram/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tgUser),
        });
        const data = await res.json();
        if (data.success) {
          onLinked?.();
        } else {
          onError?.(data.message || "Не удалось привязать Telegram");
        }
      } catch (e) {
        onError?.("Ошибка связи с сервером");
      }
    };

    const win = window as unknown as Record<string, unknown>;
    win[callbackName] = handleAuth;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-request-access", "write");
    containerRef.current.appendChild(script);

    return () => {
      delete win[callbackName];
    };
  }, [callbackName, onLinked, onError]);

  if (!SHOW_TELEGRAM_LOGIN || !TELEGRAM_BOT_USERNAME) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
