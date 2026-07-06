export const dynamic = "force-dynamic";

import { CatalogPageClient } from "@/components/catalog-page-client";
import { getCatalogProducts } from "@/lib/catalog";

export default async function CatalogPage() {
  const products = await getCatalogProducts();
  return <CatalogPageClient products={products} />;
}
