"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { products as staticProducts, type Product } from "@/lib/data";
import type { MappedProduct } from "@/lib/bot-water-map";

export function CatalogPreview({
  products: catalogProducts,
}: {
  products?: MappedProduct[];
}) {
  const products = catalogProducts?.length ? catalogProducts : staticProducts;
  const [added, setAdded] = React.useState<Set<string>>(new Set());

  const handleAdd = (product: Product) => {
    setAdded((prev) => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(125,249,255,0.03),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-primary)]">
                /02 — Каталог
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
                Вода и оборудование
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Button variant="outline" asChild>
              <Link href="/catalog" className="gap-2">
                Весь каталог
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.08}>
              <ProductCard product={product} onAdd={handleAdd} added={added.has(product.id)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
