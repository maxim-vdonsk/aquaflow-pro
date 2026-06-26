"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { MagneticButton } from "@/components/magnetic-button";

export function Cta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-hi)] bg-gradient-to-br from-[rgba(125,249,255,0.08)] to-[rgba(176,107,255,0.08)] px-6 py-16 text-center sm:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(125,249,255,0.15),transparent_60%)]" />
            <div className="relative z-10">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">
                Готовы пить чистую воду{" "}
                <span className="grad-text">каждый день?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-muted-foreground)]">
                Оформите первый заказ прямо сейчас и получите бесплатную доставку в течение 2 часов.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <MagneticButton asChild>
                  <Button size="lg" variant="default" asChild>
                    <Link href="/order">Оформить заказ →</Link>
                  </Button>
                </MagneticButton>
                <MagneticButton asChild>
                  <Button size="lg" variant="outline" className="border-[var(--color-border-hi)]" asChild>
                    <a href="tel:+78001234567" className="gap-2">
                      <Phone className="h-4 w-4" />
                      8 (800) 123-45-67
                    </a>
                  </Button>
                </MagneticButton>
              </div>

              <div className="mt-8 font-mono text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">
                <span className="text-[var(--color-primary)]">✓</span> Бесплатная доставка ·{" "}
                <span className="text-[var(--color-primary)]">✓</span> Без обязательств ·{" "}
                <span className="text-[var(--color-primary)]">✓</span> Подписка
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
