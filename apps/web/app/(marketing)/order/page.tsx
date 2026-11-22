export const dynamic = "force-dynamic";

import { getCatalogProducts } from "@/lib/catalog";
import { isPaymentsEnabled } from "@/lib/settings";
import { OrderForm } from "./order-form";

export default async function OrderPage() {
  const [catalog, paymentsOnlineEnabled] = await Promise.all([
    getCatalogProducts(),
    isPaymentsEnabled(),
  ]);
  return <OrderForm catalog={catalog} paymentsOnlineEnabled={paymentsOnlineEnabled} />;
}