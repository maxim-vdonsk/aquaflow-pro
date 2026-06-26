"use client";

import { Reveal } from "@/components/reveal";
import { TiltCard } from "@/components/tilt-card";
import { Timer, ShieldCheck, CalendarClock, Truck, Sparkles, HeadphonesIcon } from "lucide-react";

const items = [
  {
    icon: Timer,
    title: "Доставка за 2 часа",
    description: "Среднее время по городу — 90 минут. Выбирайте удобное окно.",
    color: "cyan",
  },
  {
    icon: ShieldCheck,
    title: "Сертификаты качества",
    description: "Каждая партия проходит лабораторный контроль. Отчёты в кабинете.",
    color: "pink",
  },
  {
    icon: CalendarClock,
    title: "Подписка и напоминания",
    description: "Автоматические поставки раз в неделю, две недели или месяц.",
    color: "yellow",
  },
  {
    icon: Truck,
    title: "Подъём без доплат",
    description: "Курьер занесёт воду до квартиры или офиса. Никаких скрытых сборов.",
    color: "cyan",
  },
  {
    icon: Sparkles,
    title: "Чистая многооборотная тара",
    description: "Моем и дезинфицируем бутыли после каждого цикла.",
    color: "pink",
  },
  {
    icon: HeadphonesIcon,
    title: "Поддержка 24/7",
    description: "Поможем выбрать объём, перенесём доставку или оформим подписку.",
    color: "yellow",
  },
];

const colorStyles: Record<string, string> = {
  cyan: "bg-gradient-to-br from-[rgba(125,249,255,0.22)] to-[rgba(125,249,255,0.05)] border-[rgba(125,249,255,0.3)] text-[var(--color-primary)]",
  pink: "bg-gradient-to-br from-[rgba(176,107,255,0.22)] to-[rgba(176,107,255,0.05)] border-[rgba(176,107,255,0.3)] text-[var(--color-accent)]",
  yellow: "bg-gradient-to-br from-[rgba(255,225,86,0.22)] to-[rgba(255,225,86,0.05)] border-[rgba(255,225,86,0.3)] text-[var(--color-yellow)]",
};

export function Features() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-primary)]">
              /01 — Почему AquaFlow
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
              Вода, которой можно{" "}
              <span className="grad-text">доверять</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, description, color }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <TiltCard className="h-full rounded-[var(--radius-lg)]">
                <div className="panel h-full rounded-[var(--radius-lg)] p-7">
                  <div
                    className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl border ${colorStyles[color]} shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)] leading-relaxed">{description}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
