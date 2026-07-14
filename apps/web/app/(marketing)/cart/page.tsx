"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { formatPrice } from "@/lib/utils";
import { useCartStore, useCartHydrated } from "@/lib/cart-store";

export default function CartPage() {
  const hydrated = useCartHydrated();
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const showLines = hydrated ? lines : [];
  const total = showLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const count = showLines.reduce((n, l) => n + l.qty, 0);

  return (
    <div className="relative py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(125,249,255,0.05),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-primary)]">
            /Корзина
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
            Ваша <span className="grad-text">корзина</span>
          </h1>
        </Reveal>

        {showLines.length === 0 ? (
          <Reveal delay={0.15}>
            <Card className="mt-10">
              <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)]">
                  <ShoppingBag className="h-9 w-9 text-[var(--color-muted-foreground)]" />
                </div>
                <div>
                  <p className="font-medium">Корзина пуста</p>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    Добавьте воду, кулер или аксессуары из каталога.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/catalog">В каталог</Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-3">
              {showLines.map((l) => (
                <Card key={l.id}>
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {l.name}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {formatPrice(l.price)}
                        {l.volume && l.volume !== "—" ? ` · ${l.volume}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(l.id, l.qty - 1)}
                        aria-label="Уменьшить"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {l.qty}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(l.id, l.qty + 1)}
                        disabled={l.qty >= 50}
                        aria-label="Увеличить"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="w-24 shrink-0 text-right text-sm font-semibold">
                      {formatPrice(l.price * l.qty)}
                    </span>
                    <button
                      onClick={() => remove(l.id)}
                      aria-label="Удалить"
                      className="text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-destructive)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={clear}
                  className="text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-destructive)]"
                >
                  Очистить корзину
                </button>
              </div>
            </div>

            <div>
              <Card className="lg:sticky lg:top-6">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      Товаров
                    </span>
                    <span className="text-sm">{count} шт</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      Итого
                    </span>
                    <span className="font-heading text-2xl font-bold grad-text">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/order">Перейти к оформлению →</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/catalog">Продолжить покупки</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}