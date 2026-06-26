"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import type { MappedProduct } from "@/lib/bot-water-map";

type Category = MappedProduct["category"] | "all";

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "water", label: "Вода" },
  { value: "cooler", label: "Кулеры" },
  { value: "pump", label: "Помпы" },
  { value: "accessory", label: "Аксессуары" },
];

const categoryColors: Record<Category, { active: string; inactive: string }> = {
  all: {
    active: "bg-[var(--color-foreground)] text-[var(--color-background)]",
    inactive:
      "bg-[rgba(255,255,255,0.04)] text-[var(--color-foreground)] hover:bg-[rgba(255,255,255,0.08)]",
  },
  water: {
    active:
      "bg-[var(--color-primary)] text-[var(--color-background)] shadow-[0_0_20px_rgba(125,249,255,0.35)]",
    inactive:
      "bg-[rgba(125,249,255,0.08)] text-[var(--color-primary)] border border-[rgba(125,249,255,0.25)] hover:bg-[rgba(125,249,255,0.12)]",
  },
  cooler: {
    active: "bg-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(176,107,255,0.35)]",
    inactive:
      "bg-[rgba(176,107,255,0.08)] text-[var(--color-accent)] border border-[rgba(176,107,255,0.25)] hover:bg-[rgba(176,107,255,0.12)]",
  },
  pump: {
    active:
      "bg-[var(--color-yellow)] text-[var(--color-background)] shadow-[0_0_20px_rgba(255,225,86,0.35)]",
    inactive:
      "bg-[rgba(255,225,86,0.08)] text-[var(--color-yellow)] border border-[rgba(255,225,86,0.25)] hover:bg-[rgba(255,225,86,0.12)]",
  },
  accessory: {
    active: "bg-[var(--color-rose)] text-white shadow-[0_0_20px_rgba(255,62,136,0.35)]",
    inactive:
      "bg-[rgba(255,62,136,0.08)] text-[var(--color-rose)] border border-[rgba(255,62,136,0.25)] hover:bg-[rgba(255,62,136,0.12)]",
  },
};

export function CatalogPageClient({
  products,
}: {
  products: MappedProduct[];
}) {
  const [filter, setFilter] = React.useState<Category>("all");
  const [added, setAdded] = React.useState<Set<string>>(new Set());

  const filtered =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const handleAdd = (product: MappedProduct) => {
    setAdded((prev) => new Set(prev).add(product.id));
  };

  return (
    <div className="relative py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(125,249,255,0.05),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-primary)]">
              /Каталог
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
              Вода, кулеры и{" "}
              <span className="grad-text">аксессуары</span>
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-3 max-w-xl text-[var(--color-muted-foreground)]">
              Выберите воду, кулер или аксессуары для дома и офиса. Доставим за 2 часа.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((c) => {
              const colors = categoryColors[c.value];
              const isActive = filter === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setFilter(c.value)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isActive ? colors.active : colors.inactive
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div
          layout
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {filtered.map((product, i) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <ProductCard
                product={product}
                onAdd={handleAdd}
                added={added.has(product.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <Reveal>
            <div className="mt-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center">
              <p className="text-[var(--color-muted-foreground)]">
                В этой категории пока нет товаров.
              </p>
            </div>
          </Reveal>
        )}

        {added.size > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <Badge variant="default" className="px-4 py-2 text-sm shadow-[0_8px_32px_rgba(125,249,255,0.25)]">
              В корзине {added.size} товаров
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
