"use server";

import { fetchBotWater } from "@/lib/bot-api";
import { mergeWithStaticCatalog, type MappedProduct } from "@/lib/bot-water-map";

export async function getCatalogProducts(): Promise<MappedProduct[]> {
  const botWater = await fetchBotWater();
  return mergeWithStaticCatalog(botWater);
}
