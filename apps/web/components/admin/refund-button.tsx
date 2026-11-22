"use client";

// Кнопка возврата оплаты в админке (только для оплаченных заказов).

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Undo2 } from "lucide-react";
import { refundOrder } from "@/app/actions/payment";
import { Button } from "@/components/ui/button";

export function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await refundOrder(orderId);
      setMessage(res.message ?? (res.success ? "Готово" : "Ошибка"));
      if (res.success) router.refresh();
    } catch {
      setMessage("Ошибка связи с сервером");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={busy}
        className="h-7 px-2 text-xs"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
        Вернуть
      </Button>
      {message && (
        <span className="max-w-[10rem] text-[10px] leading-tight text-[var(--color-muted-foreground)]">
          {message}
        </span>
      )}
    </span>
  );
}
