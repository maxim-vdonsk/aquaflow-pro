import Link from "next/link";
import { db, orders } from "@aquaflow/database";
import { eq } from "drizzle-orm";
import { PAYMENT_LABELS, centsToRub } from "@/lib/order-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

// Страница возврата с кассы (return_url ЮKassa и финал эмулятора). Показывает
// текущий статус оплаты: webhook обычно успевает обновить статус до перехода.
export default async function PayResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;
  const validUuid =
    order_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order_id);
  const [order] = validUuid
    ? await db
        .select({ total: orders.total, paymentStatus: orders.paymentStatus })
        .from(orders)
        .where(eq(orders.id, order_id))
        .limit(1)
    : [];

  const status = order?.paymentStatus ?? "pending";

  return (
    <div className="py-16">
      <div className="mx-auto max-w-md px-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div>
              {status === "paid" && <CheckCircle2 className="h-14 w-14 text-[#4ade80]" />}
              {status === "failed" && <XCircle className="h-14 w-14 text-[var(--color-destructive)]" />}
              {status !== "paid" && status !== "failed" && <Clock className="h-14 w-14 text-[var(--color-muted-foreground)]" />}
            </div>
            <h1 className="font-heading text-2xl font-bold">
              {status === "paid"
                ? "Оплата прошла"
                : status === "failed"
                  ? "Платёж не прошёл"
                  : "Ожидаем подтверждение оплаты"}
            </h1>
            {order && (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Заказ на {centsToRub(order.total)} · {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
              </p>
            )}
            {status === "pending" && (
              <p className="text-sm opacity-90">
                Обычно подтверждение занимает несколько секунд. Мы свяжемся с вами
                по телефону для уточнения деталей доставки.
              </p>
            )}
            <Button asChild variant="outline">
              <Link href="/catalog">Вернуться в каталог</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
