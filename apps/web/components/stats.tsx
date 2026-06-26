"use client";

import { Reveal } from "@/components/reveal";

const stats = [
  { value: "2 ч", label: "среднее время доставки" },
  { value: "19 л", label: "стандартная бутыль" },
  { value: "24/7", label: "поддержка клиентов" },
  { value: "0 ₽", label: "доставка от 2 бутылей" },
];

export function Stats() {
  return (
    <div className="border-y border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto grid max-w-7xl divide-x divide-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Reveal key={stat.label} className="px-6 py-8 text-center">
            <div className="font-heading text-3xl font-bold grad-text sm:text-4xl">{stat.value}</div>
            <div className="mt-1 font-mono text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">
              {stat.label}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
