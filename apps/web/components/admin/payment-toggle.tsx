"use client";

// Переключатель онлайн-оплаты в операторской панели сайта.

import * as React from "react";
import { useRouter } from "next/navigation";
import { togglePaymentsEnabled } from "@/app/actions/payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PaymentToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [state, setState] = React.useState<{ enabled: boolean; message: string }>({
    enabled: initialEnabled,
    message: "",
  });

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await togglePaymentsEnabled();
      setState(res);
      router.refresh();
    } catch {
      setState((s) => ({ ...s, message: "Ошибка связи с сервером" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Онлайн-оплата (ЮKassa)</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4 p-6">
        <button
          onClick={onClick}
          disabled={busy}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--color-primary)]"
        >
          {busy ? "…" : state.enabled ? "Выключить ❌" : "Включить ✅"}
        </button>
        <div>
          <p className="text-sm font-medium">
            Статус: {state.enabled ? "включена ✅" : "отключена ❌"}
          </p>
          {state.message && (
            <p className="text-xs text-[var(--color-muted-foreground)]">{state.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
