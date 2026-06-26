import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-heading text-3xl font-bold">Политика конфиденциальности</h1>
        <Card>
          <CardContent className="space-y-4 p-6 text-[var(--color-muted-foreground)]">
            <p>AquaFlow собирает только те персональные данные, которые необходимы для оформления и доставки заказов.</p>
            <p>Мы не передаём данные третьим лицам за исключением случаев, предусмотренных законодательством, и курьерской службы для выполнения доставки.</p>
            <p>Пользователь вправе запросить удаление своего аккаунта и связанных данных через службу поддержки.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
