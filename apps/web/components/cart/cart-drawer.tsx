"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore, useCartHydrated } from "@/lib/cart-store";

export function CartDrawer() {
  const hydrated = useCartHydrated();
  const isOpen = useCartStore((s) => s.isOpen);
  const lines = useCartStore((s) => s.lines);
  const close = useCartStore((s) => s.close);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  // Lock body scroll while open (mirrors header mobile-menu pattern)
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Esc to close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const showLines = hydrated ? lines : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-label="Корзина"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[rgba(3,5,10,0.97)] backdrop-blur-[24px]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-[var(--color-primary)]" />
                <span className="font-heading text-lg font-semibold">
                  Корзина
                </span>
                {count > 0 && (
                  <span className="text-sm text-[var(--color-muted-foreground)]">
                    · {count} шт
                  </span>
                )}
              </div>
              <button
                onClick={close}
                aria-label="Закрыть"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {showLines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)]">
                  <ShoppingBag className="h-9 w-9 text-[var(--color-muted-foreground)]" />
                </div>
                <div>
                  <p className="font-medium">Корзина пуста</p>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    Добавьте воду, кулер или аксессуары из каталога.
                  </p>
                </div>
                <Button asChild onClick={close}>
                  <Link href="/catalog">В каталог</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {showLines.map((l) => (
                    <div
                      key={l.id}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {l.name}
                          </p>
                          <p className="text-xs text-[var(--color-muted-foreground)]">
                            {formatPrice(l.price)}
                            {l.volume && l.volume !== "—" ? ` · ${l.volume}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(l.id)}
                          aria-label="Удалить"
                          className="text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-destructive)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQty(l.id, l.qty - 1)}
                            aria-label="Уменьшить"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">
                            {l.qty}
                          </span>
                          <button
                            onClick={() => setQty(l.id, l.qty + 1)}
                            aria-label="Увеличить"
                            disabled={l.qty >= 50}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] transition-colors hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatPrice(l.price * l.qty)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--color-border)] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      Итого
                    </span>
                    <span className="font-heading text-2xl font-bold grad-text">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <Button asChild className="mt-3 w-full" size="lg">
                    <Link href="/order" onClick={close}>
                      Оформить заказ →
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}