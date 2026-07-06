import { products } from "@/lib/data";
import type { BotWaterItem } from "@/lib/bot-api";

export interface MappedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // cents
  volume: string;
  category: "water" | "cooler" | "pump" | "accessory";
  inStock: boolean;
  water_type?: string;
}

const botToSite: Record<string, string> = {
  water1: "voda-19l",
  water2: "voda-19l-premium",
  water3: "voda-19l-super", // fallback if exists in bot
};

export function mapBotWaterToProducts(botWater: BotWaterItem[]): MappedProduct[] {
  const result: MappedProduct[] = [];

  for (const bw of botWater.filter((w) => w.visible)) {
    const slug = botToSite[bw.water_type] ?? bw.water_type;
    const fallback = products.find((p) => p.slug === slug);

    result.push({
      id: bw.water_type,
      slug,
      name: fallback?.name ?? bw.name,
      description: fallback?.description ?? "Доставка питьевой воды.",
      price: Math.round(bw.price * 100),
      volume: "19 л",
      category: "water",
      inStock: true,
      water_type: bw.water_type,
    });
  }

  return result;
}

export function mergeWithStaticCatalog(botWater: BotWaterItem[]): MappedProduct[] {
  const mapped = mapBotWaterToProducts(botWater);
  // Slugs the bot already provides — static water with the same slug is a
  // duplicate and must be dropped (bot is the source of truth for water).
  const mappedSlugs = new Set(mapped.map((p) => p.slug));

  // Append static products: non-water always, water only if not already
  // covered by the bot (e.g. bot API unavailable).
  for (const p of products) {
    if (p.category === "water") {
      if (mappedSlugs.has(p.slug)) continue;
      mapped.push({ ...p, water_type: p.id });
    } else {
      mapped.push({ ...p, water_type: undefined });
    }
  }

  return mapped;
}

export function findWaterTypeForProduct(
  productIdOrSlug: string,
  botWater: BotWaterItem[]
): string | undefined {
  const byBotType = botWater.find((w) => w.water_type === productIdOrSlug);
  if (byBotType) return byBotType.water_type;

  const reverse = Object.entries(botToSite).find(([, slug]) => slug === productIdOrSlug);
  if (reverse) return reverse[0];

  const staticProduct = products.find(
    (p) => p.id === productIdOrSlug || p.slug === productIdOrSlug
  );
  if (staticProduct?.category === "water") {
    const entry = Object.entries(botToSite).find(([, slug]) => slug === staticProduct.slug);
    return entry?.[0];
  }
  return undefined;
}