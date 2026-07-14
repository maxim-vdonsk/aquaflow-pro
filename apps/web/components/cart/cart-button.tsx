"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  useCartStore,
  useCartCount,
  useCartTotal,
  useCartHydrated,
} from "@/lib/cart-store";

interface CartButtonProps {
  /** "full" — иконка + мини-итог (десктоп); "compact" — только иконка + бейдж (мобильное меню) */
  variant?: "full" | "compact";
  className?: string;
}

export function CartButton({ variant = "full", className }: CartButtonProps) {
  const hydrated = useCartHydrated();
  const count = useCartCount();
  const total = useCartTotal();
  const toggle = useCartStore((s) => s.toggle);

  const shownCount = hydrated ? count : 0;
  const shownTotal = hydrated ? total : 0;

  return (
    <button
      onClick={toggle}
      aria-label={`Корзина, ${shownCount} товаров`}
      className={`relative flex items-center gap-2 rounded-full border border-[var(--color-border-hi)] px-3.5 py-2 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[rgba(255,255,255,0.05)] ${
        className ?? ""
      }`}
    >
      <ShoppingCart className="h-4 w-4" />
      {variant === "full" && (
        <span className="hidden lg:inline">
          {shownCount > 0 ? formatPrice(shownTotal) : "Корзина"}
        </span>
      )}
      {shownCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-xs font-bold text-[var(--color-background)] shadow-[0_0_12px_rgba(125,249,255,0.5)]">
          {shownCount}
        </span>
      )}
    </button>
  );
}