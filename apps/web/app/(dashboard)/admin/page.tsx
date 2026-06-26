import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, TrendingUp, Droplets } from "lucide-react";

const stats = [
  { icon: ShoppingCart, label: "Заказов сегодня", value: "124" },
  { icon: Users, label: "Активных клиентов", value: "3 420" },
  { icon: Droplets, label: "Бутылей доставлено", value: "1 890" },
  { icon: TrendingUp, label: "Выручка", value: "₽482 000" },
];

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (userRole !== "admin" && userRole !== "operator") {
    redirect("/account");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-heading text-3xl font-bold">Операторская панель</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
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
          <CardTitle>Последние заказы</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-[var(--color-muted-foreground)]">
            В production здесь подключается таблица orders в реальном времени.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
