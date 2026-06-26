import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-heading text-3xl font-bold">Условия использования</h1>
        <Card>
          <CardContent className="space-y-4 p-6 text-[var(--color-muted-foreground)]">
            <p>Используя сайт AquaFlow, вы соглашаетесь с правилами оформления заказов, доставки и оплаты.</p>
            <p>Сервис оставляет за собой право отменить заказ в случае отсутствия товара или невозможности связаться с получателем.</p>
            <p>Все цены указаны с учётом НДС и актуальны на момент оформления заказа.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
