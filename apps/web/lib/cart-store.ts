"use client";

import * as React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MappedProduct } from "@/lib/bot-water-map";

export interface CartLine {
  id: string;
  slug: string;
  name: string;
  price: number; // cents — snapshot, authoritative price resolved server-side at checkout
  volume: string;
  category: MappedProduct["category"];
  water_type?: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (product: MappedProduct, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === product.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === product.id
                  ? { ...l, qty: Math.min(50, l.qty + qty) }
                  : l
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                volume: product.volume,
                category: product.category,
                water_type: product.water_type,
                qty: Math.min(50, Math.max(1, qty)),
              },
            ],
          };
        }),
      setQty: (id, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { lines: state.lines.filter((l) => l.id !== id) };
          }
          return {
            lines: state.lines.map((l) =>
              l.id === id ? { ...l, qty: Math.min(50, Math.floor(qty)) } : l
            ),
          };
        }),
      remove: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "aquaflow-cart",
      storage: createJSONStorage(() => localStorage),
      // isOpen is UI state — never persisted (drawer must not auto-open on load)
      partialize: (state) => ({ lines: state.lines }),
    }
  )
);

// --- Derived selectors -------------------------------------------------------

export const useCartCount = () =>
  useCartStore((s) => s.lines.reduce((n, l) => n + l.qty, 0));

export const useCartTotal = () =>
  useCartStore((s) => s.lines.reduce((sum, l) => sum + l.price * l.qty, 0));

export const useCartQty = (id: string) =>
  useCartStore((s) => s.lines.find((l) => l.id === id)?.qty ?? 0);

// --- Hydration helper --------------------------------------------------------
// zustand persist rehydrates on the client after mount. SSR renders the empty
// initial state, so components reading the cart must render 0 until mounted to
// avoid React hydration mismatches.

export function useCartHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    // persist finishes rehydrating synchronously-ish on first effect run
    setHydrated(true);
  }, []);
  return hydrated;
}