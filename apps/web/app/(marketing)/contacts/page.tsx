import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { OPERATOR } from "@/lib/legal";

const contacts = [
  ...(OPERATOR.phone
    ? [
        {
          icon: Phone,
          label: "Телефон",
          value: OPERATOR.phone,
          href: `tel:${OPERATOR.phone.replace(/[^\d+]/g, "")}`,
        },
      ]
    : []),
  ...(OPERATOR.email
    ? [
        {
          icon: Mail,
          label: "Email",
          value: OPERATOR.email,
          href: `mailto:${OPERATOR.email}`,
        },
      ]
    : []),
  { icon: MapPin, label: "Адрес", value: OPERATOR.address, href: "#" },
  {
    icon: Clock,
    label: "Режим работы",
    value: "Ежедневно 08:00–22:00",
    href: "#",
  },
];

export const metadata = {
  title: "Контакты",
  description: "Свяжитесь с нами для заказа доставки воды",
};

export default function ContactsPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">Контакты</h1>
          <p className="mt-2 text-[var(--color-muted-foreground)]">
            Свяжитесь с нами удобным способом — мы ответим в течение нескольких минут.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{OPERATOR.legalName}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {contacts.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-start gap-4 rounded-[var(--radius-md)] p-3 transition-colors hover:bg-[var(--color-muted)]"
              >
                <div className="rounded-xl bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted-foreground)]">{label}</div>
                  <div className="font-medium">{value}</div>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
          Реквизиты продавца — в разделе{" "}
          <a href="/terms" className="text-[var(--color-primary)] underline hover:opacity-80">
            «Порядок оформления заказа»
          </a>
          .
        </p>
      </div>
    </div>
  );
}