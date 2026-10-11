import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, orders, orderItems, user } from "@aquaflow/database";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { getCatalogProducts } from "@/lib/catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, TrendingUp, CalendarClock } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "Новый",
  confirmed: "Подтверждён",
  preparing: "Собирается",
  delivering: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-600",
  confirmed: "text-sky-600",
  preparing: "text-sky-600",
  delivering: "text-sky-600",
  delivered: "text-emerald-600",
  cancelled: "text-red-600",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Ошибка оплаты",
  refunded: "Возврат",
};

const moneyFmt = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (userRole !== "admin" && userRole !== "operator") {
    redirect("/account");
  }

  const [catalog, lastOrders, statsRows, usersRows] = await Promise.all([
    getCatalogProducts().catch(() => [] as Awaited<ReturnType<typeof getCatalogProducts>>),
    db
      .select({
        id: orders.id,
        createdAt: orders.createdAt,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        total: orders.total,
        scheduledAt: orders.scheduledAt,
        customerName: user.name,
        customerEmail: user.email,
      })
      .from(orders)
      .leftJoin(user, eq(user.id, orders.userId))
      .orderBy(desc(orders.createdAt))
      .limit(20),
    db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        todayOrders: sql<number>`(count(*) filter (where ${orders.createdAt} >= date_trunc('day', now())))::int`,
        revenue: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} <> 'cancelled'), 0)::int`,
      })
      .from(orders),
    db.select({ users: sql<number>`count(*)::int` }).from(user),
  ]);

  const [stats] = statsRows;
  const [{ users: userCount }] = usersRows;

  const orderIds = lastOrders.map((o) => o.id);
  const items = orderIds.length
    ? await db
        .select({
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds))
    : [];

  const productNames = new Map(catalog.map((p) => [p.id, p.name]));
  const itemsByOrder = new Map<string, string>();
  for (const item of items) {
    const label = `${item.quantity} × ${productNames.get(item.productId) ?? item.productId}`;
    const prev = itemsByOrder.get(item.orderId);
    itemsByOrder.set(item.orderId, prev ? `${prev}, ${label}` : label);
  }

  const statCards = [
    { icon: ShoppingCart, label: "Заказов всего", value: String(stats.totalOrders) },
    { icon: CalendarClock, label: "Заказов сегодня", value: String(stats.todayOrders) },
    { icon: Users, label: "Пользователей сайта", value: String(userCount) },
    {
      icon: TrendingUp,
      label: "Выручка (без отмен)",
      value: moneyFmt.format(stats.revenue / 100),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-heading text-3xl font-bold">Операторская панель</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-[var(--color-muted-foreground)]">{label}</div>
                <div className="font-heading text-2xl font-bold">{value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Последние заказы (20)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {lastOrders.length === 0 ? (
            <p className="p-6 text-[var(--color-muted-foreground)]">Заказов пока нет.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr className="border-b text-[var(--color-muted-foreground)]">
                    <th className="px-6 py-3 font-medium">Дата</th>
                    <th className="px-6 py-3 font-medium">Клиент</th>
                    <th className="px-6 py-3 font-medium">Состав</th>
                    <th className="px-6 py-3 text-right font-medium">Сумма</th>
                    <th className="px-6 py-3 font-medium">Оплата</th>
                    <th className="px-6 py-3 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lastOrders.map((order) => (
                    <tr key={order.id} className="align-top">
                      <td className="whitespace-nowrap px-6 py-4 text-[var(--color-muted-foreground)]">
                        {dateFmt.format(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {order.customerName ?? "Гость (заказ с сайта)"}
                        <div className="text-xs text-[var(--color-muted-foreground)]">
                          {order.customerEmail ?? "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">{itemsByOrder.get(order.id) ?? "—"}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                        {moneyFmt.format(order.total / 100)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[var(--color-muted-foreground)]">
                        {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium">
                        <span
                          className={
                            STATUS_STYLES[order.status] ?? "text-[var(--color-foreground)]"
                          }
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}