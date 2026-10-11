import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db, orders, orderItems, user } from "@aquaflow/database";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { getCatalogProducts } from "@/lib/catalog";
import { products as staticProducts } from "@/lib/data";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  PAYMENT_LABELS,
  centsToRub,
  formatOrderDate,
} from "@/lib/order-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUsers } from "@/components/admin/admin-users";
import { Users, ShoppingCart, TrendingUp, CalendarClock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (userRole !== "admin" && userRole !== "operator") {
    redirect("/account");
  }

  const { tab } = await searchParams;
  const activeTab = tab === "users" ? "users" : "orders";

  const accountUsers =
    activeTab === "users"
      ? await db
          .select({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          })
          .from(user)
          .orderBy(desc(user.createdAt))
      : [];

  const [catalog, lastOrders, statsRows, usersRows] = await Promise.all([
    activeTab === "orders"
      ? getCatalogProducts().catch(() => [] as Awaited<ReturnType<typeof getCatalogProducts>>)
      : Promise.resolve([] as Awaited<ReturnType<typeof getCatalogProducts>>),
    activeTab === "orders"
      ? db
          .select({
            id: orders.id,
            createdAt: orders.createdAt,
            status: orders.status,
            paymentStatus: orders.paymentStatus,
            total: orders.total,
            scheduledAt: orders.scheduledAt,
            customerName: user.name,
            customerEmail: user.email,
            contactName: orders.contactName,
            contactPhone: orders.contactPhone,
          })
          .from(orders)
          .leftJoin(user, eq(user.id, orders.userId))
          .orderBy(desc(orders.createdAt))
          .limit(20)
      : Promise.resolve([]),
    activeTab === "orders"
      ? db
          .select({
            totalOrders: sql<number>`count(*)::int`,
            todayOrders: sql<number>`(count(*) filter (where ${orders.createdAt} >= date_trunc('day', now())))::int`,
            revenue: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} <> 'cancelled'), 0)::int`,
          })
          .from(orders)
      : Promise.resolve([] as Array<{ totalOrders: number; todayOrders: number; revenue: number }>),
    activeTab === "orders"
      ? db.select({ users: sql<number>`count(*)::int` }).from(user)
      : Promise.resolve([] as Array<{ users: number }>),
  ]);

  const [stats] = statsRows;
  const userCount = usersRows.length ? usersRows[0].users : 0;

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

  // The live catalog maps water by slug (bot id "water1"…), so historical
  // order_items with static-catalog uuids must fall back to lib/data names.
  const productNames = new Map(catalog.map((p) => [p.id, p.name]));
  for (const p of staticProducts) {
    if (!productNames.has(p.id)) productNames.set(p.id, p.name);
  }
  const itemsByOrder = new Map<string, string>();
  for (const item of items) {
    const label = `${item.quantity} × ${productNames.get(item.productId) ?? item.productId}`;
    const prev = itemsByOrder.get(item.orderId);
    itemsByOrder.set(item.orderId, prev ? `${prev}, ${label}` : label);
  }

  // statCards live on the orders tab only; statsRows is empty on the users
  // tab, so guard the whole computation instead of destructure-crashing.
  const statCards =
    activeTab === "orders" && statsRows.length > 0
      ? [
          { icon: ShoppingCart, label: "Заказов всего", value: String(stats.totalOrders) },
          { icon: CalendarClock, label: "Заказов сегодня", value: String(stats.todayOrders) },
          { icon: Users, label: "Пользователей сайта", value: String(userCount) },
          {
            icon: TrendingUp,
            label: "Выручка (без отмен)",
            value: centsToRub(stats.revenue),
          },
        ]
      : [];

  const tabs = [
    { key: "orders", label: "Заявки", href: "/admin" },
    { key: "users", label: "Пользователи", href: "/admin?tab=users" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-heading text-3xl font-bold">Операторская панель</h1>

      <div className="mb-8 flex gap-2 border-b border-[var(--color-border)]">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href as any}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "users" ? (
        <Card>
          <CardHeader>
            <CardTitle>Пользователи сайта и права</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-6">
            <AdminUsers users={accountUsers} />
          </CardContent>
        </Card>
      ) : (
        <>
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
                            {formatOrderDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            {order.customerName ?? order.contactName ?? "Гость (заказ с сайта)"}
                            <div className="text-xs text-[var(--color-muted-foreground)]">
                              {order.customerEmail ?? order.contactPhone ?? "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4">{itemsByOrder.get(order.id) ?? "—"}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                            {centsToRub(order.total)}
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
        </>
      )}
    </div>
  );
}