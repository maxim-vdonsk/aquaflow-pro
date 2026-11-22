"use client";

// Клиентская часть эмулятора кассы ЮKassa. Шлёт в реальный webhook-роут
// /api/yookassa/webhook настоящий формат HTTP-уведомления ЮKassa — так
// прогоняется боевой путь обработки статусов, кроме сетевых вызовов.

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function FakeCheckout({
  orderId,
  paymentId,
  totalCents,
  initialStatus,
}: {
  orderId: string;
  paymentId: string;
  totalCents: number;
  initialStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<"pay" | "cancel" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const notify = async (event: "payment.succeeded" | "payment.canceled") => {
    if (busy) return;
    setBusy(event === "payment.succeeded" ? "pay" : "cancel");
    setError(null);
    try {
      const res = await fetch("/api/yookassa/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notification",
          event,
          object: {
            id: paymentId,
            status: event === "payment.succeeded" ? "succeeded" : "canceled",
            paid: event === "payment.succeeded",
            amount: { value: (totalCents / 100).toFixed(2), currency: "RUB" },
            metadata: { order_id: orderId },
          },
        }),
      });
      if (!res.ok) throw new Error(`webhook → HTTP ${res.status}`);
      router.push(`/pay/result?order_id=${orderId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка соединения");
      setBusy(null);
    }
  };

  const done = initialStatus !== "pending";

  return (
    <div className="py-16">
      <div className="mx-auto max-w-md px-4">
        <div className="mb-4 rounded-[var(--radius-md)] border border-[rgba(250,204,21,0.4)] bg-[rgba(250,204,21,0.12)] p-4 text-sm">
          <p className="font-semibold">Эмулятор кассы ЮKassa (fake-режим)</p>
          <p className="mt-1 opacity-90">
            Реальные деньги не списываются. Кнопки шлют настоящий формат вебхука
            ЮKassa — проверяется полный боевой путь.
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-6">
          <p className="text-sm text-[var(--color-muted-foreground)]">Заказ №{orderId.slice(0, 8)}</p>
          <p className="mt-1 font-heading text-3xl font-bold grad-text">{formatPrice(totalCents)}</p>

          <div className="mt-6 space-y-3">
            <Button
              className="w-full"
              size="lg"
              disabled={done || busy !== null}
              onClick={() => notify("payment.succeeded")}
            >
              {busy === "pay" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Оплатить {formatPrice(totalCents)}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={done || busy !== null}
              onClick={() => notify("payment.canceled")}
            >
              Отменить платёж
            </Button>
            {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
