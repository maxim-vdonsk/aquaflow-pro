"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderSchema, type OrderInput } from "@/lib/schema";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/app/actions/order";

export default function OrderPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      productId: products[0].id,
      quantity: 2,
      scheduledAt: "",
    },
  });

  const [result, setResult] = React.useState<
    Awaited<ReturnType<typeof createOrder>> | null
  >(null);

  const productId = watch("productId");
  const quantity = watch("quantity") || 1;
  const product = products.find((p) => p.id === productId) || products[0];
  const total = product.price * quantity;

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const onSubmit = async (data: OrderInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    const res = await createOrder(formData);
    setResult(res);
  };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-5xl">
            Оформление <span className="grad-text">заказа</span>
          </h1>
          <p className="mt-2 text-[var(--color-muted-foreground)]">
            Заполните форму — мы перезвоним для подтверждения.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader>
                <CardTitle>Контакты и адрес</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-[var(--color-muted-foreground)]">Имя</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                      <Input id="name" {...register("name")} className="pl-9" placeholder="Иван Иванов" />
                    </div>
                    {errors.name && <p className="text-sm text-[var(--color-destructive)]">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-[var(--color-muted-foreground)]">Телефон</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                      <Input id="phone" {...register("phone")} className="pl-9" placeholder="+7 (900) 000-00-00" />
                    </div>
                    {errors.phone && <p className="text-sm text-[var(--color-destructive)]">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-[var(--color-muted-foreground)]">Адрес доставки</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                    <Input id="address" {...register("address")} className="pl-9" placeholder="ул. Примерная, 12, кв. 5" />
                  </div>
                  {errors.address && <p className="text-sm text-[var(--color-destructive)]">{errors.address.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="apartment" className="text-sm font-medium text-[var(--color-muted-foreground)]">Квартира</label>
                    <Input id="apartment" {...register("apartment")} placeholder="5" />
                    {errors.apartment && <p className="text-sm text-[var(--color-destructive)]">{errors.apartment.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="floor" className="text-sm font-medium text-[var(--color-muted-foreground)]">Этаж</label>
                    <Input id="floor" {...register("floor")} placeholder="3" />
                    {errors.floor && <p className="text-sm text-[var(--color-destructive)]">{errors.floor.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="scheduledAt" className="text-sm font-medium text-[var(--color-muted-foreground)]">Дата доставки</label>
                    <Input id="scheduledAt" type="date" min={minDate} {...register("scheduledAt")} />
                    {errors.scheduledAt && <p className="text-sm text-[var(--color-destructive)]">{errors.scheduledAt.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="comment" className="text-sm font-medium text-[var(--color-muted-foreground)]">Комментарий</label>
                  <Input id="comment" {...register("comment")} placeholder="Подъезд, код домофона, удобное время" />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="productId" className="text-sm font-medium text-[var(--color-muted-foreground)]">Продукт</label>
                    <select
                      id="productId"
                      {...register("productId")}
                      className="flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-input)] bg-[rgba(255,255,255,0.04)] px-3 text-sm text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="quantity" className="text-sm font-medium text-[var(--color-muted-foreground)]">Количество</label>
                    <Input id="quantity" type="number" min={1} max={50} {...register("quantity")} />
                    {errors.quantity && <p className="text-sm text-[var(--color-destructive)]">{errors.quantity.message}</p>}
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                    <span className="text-sm text-[var(--color-muted-foreground)]">Итого</span>
                    <span className="font-heading text-2xl font-bold grad-text">{formatPrice(total)}</span>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Создание…
                      </>
                    ) : (
                      "Подтвердить заказ"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card
              className={`${
                result.success
                  ? "border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
                  : "border-[rgba(255,62,136,0.3)] bg-[rgba(255,62,136,0.08)] text-[var(--color-destructive)]"
              }`}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">{result.success ? "Заказ создан" : "Ошибка"}</p>
                  <p className="text-sm opacity-90">{result.message}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
