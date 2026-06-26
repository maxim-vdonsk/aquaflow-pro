import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { AccountTelegramLink } from "@/components/account-telegram-link";
import { AccountEmailVerify } from "@/components/account-email-verify";
import { updatePhone } from "@/app/actions/profile";
import {
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Mail,
  Smartphone,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

const menu = [
  { icon: Package, title: "Мои заказы", desc: "История и статусы доставок" },
  { icon: MapPin, title: "Адреса", desc: "Управление адресами доставки" },
  { icon: Calendar, title: "Подписки", desc: "Регулярные поставки воды" },
  { icon: CreditCard, title: "Оплата", desc: "Способы оплаты и чеки" },
];

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold">Личный кабинет</h1>
          <p className="text-[var(--color-muted-foreground)]">{u.name || u.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-[var(--color-accent)]" />
              Telegram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted-foreground)]">Статус</span>
              <span className="font-medium">
                {u.telegramId ? `Привязан (ID ${u.telegramId})` : "Не привязан"}
              </span>
            </div>
            {!u.telegramId ? (
              <>
                <AccountTelegramLink />
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Нажмите кнопку выше, чтобы привязать Telegram-аккаунт.
                </p>
              </>
            ) : (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Telegram уже привязан к аккаунту.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {menu.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold">{title}</h3>
                <p className="text-sm text-[var(--color-muted-foreground)]">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
