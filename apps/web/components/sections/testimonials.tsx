"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { TiltCard } from "@/components/tilt-card";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-primary)]">
              /03 — Отзывы
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
              Что говорят{" "}
              <span className="grad-text">клиенты</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <TiltCard className="h-full rounded-[var(--radius-lg)]">
                <Card className="h-full border-[var(--color-border)] bg-[var(--color-card)]">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < t.rating
                              ? "fill-[var(--color-primary)] text-[var(--color-primary)] drop-shadow-[0_0_6px_rgba(125,249,255,0.5)]"
                              : "text-[var(--color-border)]"
                          }`}
                        />
                      ))}
                    </div>
                    <blockquote className="flex-1 text-[var(--color-card-foreground)]">“{t.text}”</blockquote>
                    <div className="mt-4">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-[var(--color-muted-foreground)]">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
