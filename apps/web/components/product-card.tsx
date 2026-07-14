"use client";

import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/tilt-card";
import { MagneticButton } from "@/components/magnetic-button";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product) => void;
  added?: boolean;
  qty?: number;
}

const categoryLabels: Record<Product["category"], string> = {
  water: "Вода",
  cooler: "Кулер",
  pump: "Помпа",
  accessory: "Аксессуар",
};

const categoryColor: Record<Product["category"], "cyan" | "pink" | "yellow" | "accent"> = {
  water: "cyan",
  cooler: "pink",
  pump: "yellow",
  accessory: "accent",
};

export function ProductCard({ product, onAdd, added, qty }: ProductCardProps) {
  return (
    <TiltCard className="h-full rounded-[var(--radius-lg)]">
      <Card className="flex h-full flex-col overflow-hidden border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[rgba(125,249,255,0.12)] via-[rgba(6,182,212,0.08)] to-[rgba(176,107,255,0.12)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(3,5,10,0.6)] border border-[var(--color-border)] shadow-[0_0_30px_rgba(125,249,255,0.15)] backdrop-blur-sm">
              <span className="text-center text-xs font-semibold grad-text">
                {product.volume}
              </span>
            </div>
          </div>
          <Badge className="absolute left-3 top-3" variant={categoryColor[product.category]}>
            {categoryLabels[product.category]}
          </Badge>
        </div>
        <CardContent className="flex-1 p-5">
          <h3 className="font-heading text-lg font-semibold">{product.name}</h3>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{product.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-5 pt-0">
          <span className="font-heading text-xl font-bold grad-text">{formatPrice(product.price)}</span>
          <MagneticButton asChild>
            <Button
              size="sm"
              variant={added ? "secondary" : "default"}
              onClick={() => onAdd?.(product)}
              aria-label={added ? "Добавить ещё" : "Добавить в корзину"}
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">
                {added ? `В корзине: ${qty ?? 1}` : "В корзину"}
              </span>
            </Button>
          </MagneticButton>
        </CardFooter>
      </Card>
    </TiltCard>
  );
}
