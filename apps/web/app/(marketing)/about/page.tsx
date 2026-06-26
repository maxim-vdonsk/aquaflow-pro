import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { Droplets, ShieldCheck, Leaf, Truck } from "lucide-react";

const values = [
  {
    icon: Droplets,
    title: "Чистота",
    text: "Мы используем многоступенчатую очистку и регулярную лабораторную проверку каждой партии.",
    color: "cyan",
  },
  {
    icon: ShieldCheck,
    title: "Надёжность",
    text: "Собственный автопарк и проверенные курьеры. Заказ будет вовремя или раньше.",
    color: "pink",
  },
  {
    icon: Leaf,
    title: "Экология",
    text: "Многооборотная тара снижает количество одноразового пластика.",
    color: "yellow",
  },
  {
    icon: Truck,
    title: "Скорость",
    text: "Большинство адресов в черте города мы покрываем за 90 минут.",
    color: "cyan",
  },
];

const colorStyles: Record<string, string> = {
  cyan: "bg-gradient-to-br from-[rgba(125,249,255,0.22)] to-[rgba(125,249,255,0.05)] border-[rgba(125,249,255,0.3)] text-[var(--color-primary)]",
  pink: "bg-gradient-to-br from-[rgba(176,107,255,0.22)] to-[rgba(176,107,255,0.05)] border-[rgba(176,107,255,0.3)] text-[var(--color-accent)]",
  yellow: "bg-gradient-to-br from-[rgba(255,225,86,0.22)] to-[rgba(255,225,86,0.05)] border-[rgba(255,225,86,0.3)] text-[var(--color-yellow)]",
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Reveal>
            <h1 className="font-heading text-3xl font-bold sm:text-5xl">
              О <span className="grad-text">AquaFlow</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-[var(--color-muted-foreground)]">
              Мы верим, что качественная питьевая вода должна быть доступной каждому. Поэтому создали сервис,
              который берёт всю рутину доставки на себя: от заказа до напоминания о следующей бутыли.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, text, color }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-xl border p-3 ${colorStyles[color]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-[var(--color-muted-foreground)]">{text}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
