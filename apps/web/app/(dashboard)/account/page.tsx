import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db, orders, orderItems, addresses, subscriptions, products } from "@aquaflow/database";
import { desc, eq, inArray, or, sql } from "drizzle-orm";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { AccountEmailVerify } from "@/components/account-email-verify";
import { updatePhone } from "@/app/actions/profile";
import { addAddress, deleteAddress } from "@/app/actions/addresses";
import { addSubscription, cancelSubscription } from "@/app/actions/subscriptions";
import {
  Mail,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  ShoppingBag,
  MapPin,
  Repeat,
  CreditCard,
  Trash2,
  X,
} from "lucide-react";

const FREQ_LABELS: Record<string, string> = {
  weekly: "раз в неделю",
  biweekly: "раз в 2 недели",
  monthly: "раз в месяц",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user;

  if (!u) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h1 className="font-heading text-2xl font-bold">Требуется авторизация</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          <a href="/login" className="text-[var(--color-primary)] hover:underline">Войдите</a>, чтобы открыть личный кабинет.
        </p>
      </div>
    );
  }

  const verified = Boolean(u.emailVerified);

  // Orders attached to the account or, for guest history, to the last 10
  // digits of the account phone (+7/8 prefix insensitive).
  const myPhoneDigits =
    (u.phone || "").replace(/\D/g, "").slice(-10) || null;
  const myOrders = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      total: orders.total,
    })
    .from(orders)
    .where(
      or(
        eq(orders.userId, u.id),
        myPhoneDigits
          ? sql`right(regexp_replace(${orders.contactPhone}, '[^0-9]', '', 'g'), 10) = ${myPhoneDigits}`
          : sql`false`,
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(20);

  const [catalog] = await Promise.all([
    myOrders.length
      ? getCatalogProducts().catch(() => [] as Awaited<ReturnType<typeof getCatalogProducts>>)
      : Promise.resolve([] as Awaited<ReturnType<typeof getCatalogProducts>>),
  ]);

  const myOrderIds = myOrders.map((o) => o.id);
  const myItems = myOrderIds.length
    ? await db
        .select({
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(inArray(orderItems.orderId, myOrderIds))
    : [];

  const productNames = new Map(catalog.map((p) => [p.id, p.name]));
  for (const p of staticProducts) {
    if (!productNames.has(p.id)) productNames.set(p.id, p.name);
  }
  const itemsByOrder = new Map<string, string>();
  for (const item of myItems) {
    const label = `${item.quantity} × ${productNames.get(item.productId) ?? item.productId}`;
    const prev = itemsByOrder.get(item.orderId);
    itemsByOrder.set(item.orderId, prev ? `${prev}, ${label}` : label);
  }

  const myAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, u.id))
    .orderBy(desc(addresses.createdAt));

  const mySubs = await db
    .select({
      id: subscriptions.id,
      frequency: subscriptions.frequency,
      nextDeliveryAt: subscriptions.nextDeliveryAt,
      active: subscriptions.active,
      productName: products.name,
    })
    .from(subscriptions)
    .innerJoin(products, eq(products.id, subscriptions.productId))
    .where(eq(subscriptions.userId, u.id))
    .orderBy(desc(subscriptions.createdAt));

  const catalogProducts = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .limit(30);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold">Личный кабинет</h1>
          <p className="text-[var(--color-muted-foreground)]">{u.name || u.email}</p>
        </div>
        <SignOutButton />
      </div>

      {(u as { role?: string }).role === "admin" && (
        <Link href="/admin" className="mb-8 block">
          <Card className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 transition-colors hover:border-[var(--color-primary)]/60">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-heading font-bold">Панель администратора</div>
                <div className="text-sm text-[var(--color-muted-foreground)]">
                  Заявки, клиенты, назначение прав →
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/order">
            <ShoppingBag className="h-4 w-4" />
            Сделать заказ
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalog">Посмотреть каталог</Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-[var(--color-primary)]" />
            Контакты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-muted-foreground)]">Email</span>
            <span className="font-medium">{u.email}</span>
          </div>
          <div className="flex items-center gap-2">
            {verified ? (
              <>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Почта подтверждена</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4 text-[var(--color-yellow)]" />
                <span className="text-sm text-[var(--color-yellow)]">Почта не подтверждена</span>
              </>
            )}
          </div>
          {!verified && <AccountEmailVerify email={u.email} />}

          <form action={updatePhone} className="space-y-2 pt-2">
            <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4 text-[var(--color-primary)]" />
              Телефон
            </label>
            <div className="flex gap-2">
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={u.phone || ""}
                placeholder="+7 999 123-45-67"
              />
              <Button type="submit" variant="outline">Сохранить</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Мои заказы</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myOrders.length === 0 ? (
            <p className="p-6 text-[var(--color-muted-foreground)]">
              Заказов пока нет. История: заказы с аккаунта и заказы по твоему
              телефону (даже сделанные без входа).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr className="border-b text-[var(--color-muted-foreground)]">
                    <th className="px-6 py-3 font-medium">Дата</th>
                    <th className="px-6 py-3 font-medium">Состав</th>
                    <th className="px-6 py-3 text-right font-medium">Сумма</th>
                    <th className="px-6 py-3 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-[var(--color-muted-foreground)]">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">{itemsByOrder.get(order.id) ?? "—"}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                        {centsToRub(order.total)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium">
                        <span
                          className={
                            STATUS_STYLES[order.status] ?? "text-[var(--color-foreground)]"
                          }
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                        <span className="block text-xs text-[var(--color-muted-foreground)]">
                          {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
            Адреса доставки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {myAddresses.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Адресов пока нет — добавь первый ниже.
            </p>
          ) : (
            <ul className="divide-y">
              {myAddresses.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      {a.city}, {a.street}
                      {a.apartment ? `, кв. ${a.apartment}` : ""}
                      {a.entrance ? `, под. ${a.entrance}` : ""}
                      {a.floor ? `, эт. ${a.floor}` : ""}
                      {a.isDefault && (
                        <span className="ml-2 rounded bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-xs text-[var(--color-primary)]">
                          основной
                        </span>
                      )}
                    </div>
                    {a.comment && (
                      <div className="truncate text-xs text-[var(--color-muted-foreground)]">{a.comment}</div>
                    )}
                  </div>
                  <form action={deleteAddress}>
                    <input type="hidden" name="addressId" value={a.id} />
                    <Button type="submit" variant="outline" size="sm" aria-label="Удалить адрес">
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form action={addAddress} className="space-y-3 border-t border-[var(--color-border)] pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="city" placeholder="Город" required />
              <Input name="street" placeholder="Улица, дом" required />
              <Input name="apartment" placeholder="Квартира" />
              <Input name="entrance" placeholder="Подъезд" />
              <Input name="floor" placeholder="Этаж" />
              <Input name="comment" placeholder="Комментарий водителю" />
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <input type="checkbox" name="isDefault" className="h-4 w-4" />
              Сделать основным адресом
            </label>
            <Button type="submit">Добавить адрес</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Repeat className="h-5 w-5 text-[var(--color-primary)]" />
            Подписки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mySubs.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Подписок нет — оформи регулярную доставку ниже.
            </p>
          ) : (
            <ul className="divide-y">
              {mySubs.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-medium">{s.productName}</div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      {FREQ_LABELS[s.frequency] ?? s.frequency}
                      {s.active
                        ? ` · след. доставка ${formatOrderDate(s.nextDeliveryAt)}`
                        : " · отменена"}
                    </div>
                  </div>
                  {s.active && (
                    <form action={cancelSubscription}>
                      <input type="hidden" name="subscriptionId" value={s.id} />
                      <Button type="submit" variant="outline" size="sm">
                        <X className="h-4 w-4" />
                        Отменить
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}

          {catalogProducts.length > 0 && (
            <form action={addSubscription} className="grid gap-3 border-t border-[var(--color-border)] pt-4 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  name="productId"
                  required
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Выбрать товар…</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select
                  name="frequency"
                  required
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="weekly">раз в неделю</option>
                  <option value="biweekly">раз в 2 недели</option>
                  <option value="monthly">раз в месяц</option>
                </select>
                <Input name="nextDeliveryAt" type="date" required />
              </div>
              <Button type="submit" className="shrink-0">Подписаться</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
            Оплата
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          Оплата принимается при получении заказа: наличными или переводом.
          Статус оплаты каждого заказа показан в таблице «Мои заказы» выше
          (Ожидает оплаты / Оплачен).
        </CardContent>
      </Card>
    </div>
  );
}