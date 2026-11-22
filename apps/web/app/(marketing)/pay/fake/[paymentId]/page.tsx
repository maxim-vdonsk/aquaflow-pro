import { notFound } from "next/navigation";
import { db, orders } from "@aquaflow/database";
import { eq } from "drizzle-orm";
import { yookassaMode } from "@/lib/yookassa";
import { FakeCheckout } from "./fake-checkout";

export const dynamic = "force-dynamic";

// Эмулятор кассы ЮKassa (только для YOOKASSA_MODE=fake). URL платежа:
// confirmationUrl = /pay/fake/<payment_id>. Стилизация под чекаут ЮKassa —
// чтобы визуально прогнать тот же путь, что в бою, с теми же статусами.
export default async function FakeCashierPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  if (yookassaMode() !== "fake") notFound();

  const { paymentId } = await params;
  const [order] = await db
    .select({ id: orders.id, total: orders.total, paymentStatus: orders.paymentStatus })
    .from(orders)
    .where(eq(orders.paymentId, paymentId))
    .limit(1);
  if (!order) notFound();

  return (
    <FakeCheckout
      orderId={order.id}
      paymentId={paymentId}
      totalCents={order.total}
      initialStatus={order.paymentStatus}
    />
  );
}
