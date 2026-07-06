import { getCatalogProducts } from "@/lib/catalog";
import { OrderForm } from "./order-form";

export default async function OrderPage() {
  const catalog = await getCatalogProducts();
  return <OrderForm catalog={catalog} />;
}