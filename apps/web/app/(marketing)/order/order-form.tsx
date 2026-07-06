"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MapPin, Minus, Phone, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderSchema, type OrderInput } from "@/lib/schema";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/app/actions/order";
import type { MappedProduct } from "@/lib/bot-water-map";

const CATEGORY_LABEL: Record<string, string> = {
  water: "Вода",
  cooler: "Кулеры",
  pump: "Помпы",
  accessory: "Аксессуары",
};

const CATEGORY_ORDER = ["water", "cooler", "pump", "accessory"];

export function OrderForm({ catalog }: { catalog: MappedProduct[] }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      apartment: "",
      floor: "",
      scheduledAt: "",
      comment: "",
    },
  });

  const [qty, setQty] = React.useState<Record<string, number>>({});
  const [result, setResult] = React.useState<
    Awaited<ReturnType<typeof createOrder>> | null
  >(null);

  const setQuantity = (id: string, value: number) => {
    const next = Math.max(0, Math.min(50, Math.floor(value) || 0));
    setQty((prev) => ({ ...prev, [id]: next }));
  };

  const selectedItems = React.useMemo(
    () =>
      catalog
        .map((p) => ({ product: p, quantity: qty[p.id] || 0 }))
        .filter((it) => it.quantity > 0),
    [catalog, qty]
  );

  const total = selectedItems.reduce(
    (sum, it) => sum + it.product.price * it.quantity,
    0
  );

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const grouped = React.useMemo(() => {
    const groups: { category: string; items: MappedProduct[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = catalog.filter((p) => p.category === cat);
      if (items.length) groups.push({ category: cat, items });
    }
    return groups;
  }, [catalog]);

  const onSubmit = async (data: OrderInput) => {
    if (selectedItems.length === 0) {
      setResult({
        success: false,
        message: "Добавьте хотя бы один товар в заказ",
      } as Awaited<ReturnType<typeof createOrder>>);
      return;
    }
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    formData.append("address", data.address);
    if (data.apartment) formData.append("apartment", data.apartment);
    if (data.floor) formData.append("floor", data.floor);
    formData.append("scheduledAt", data.scheduledAt);
    if (data.comment) formData.append("comment", data.comment);
    formData.append(
      "items",
      JSON.stringify(
        selectedItems.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        }))
      )
    );
    const res = await createOrder(formData);
    setResult(res);
    if (res?.success) setQty({});
  };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-5xl">
            Оформление <span className="grad-text">заказа</span>
          </h1>
          <p className="mt-2 text-[var(--color-muted-foreground)]">
            Выберите товары и количество — мы перезвоним для подтверждения.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              {grouped.map((group) => (
                <Card key={group.category}>
                  <CardHeader>
                    <CardTitle>{CATEGORY_LABEL[group.category] || group.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {group.items.map((p) => {
                      const q = qty[p.id] || 0;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[var(--color-foreground)]">
                              {p.name}
                            </p>
                            <p className="text-xs text-[var(--color-muted-foreground)]">
                              {formatPrice(p.price)}
                              {p.volume && p.volume !== "—" ? ` · ${p.volume}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setQuantity(p.id, q - 1)}
                              disabled={q <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              max={50}
                              value={q}
                              onChange={(e) => setQuantity(p.id, Number(e.target.value))}
                              className="h-8 w-16 text-center"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setQuantity(p.id, q + 1)}
                              disabled={q >= 50}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}

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
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="floor" className="text-sm font-medium text-[var(--color-muted-foreground)]">Этаж</label>
                      <Input id="floor" {...register("floor")} placeholder="3" />
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
            </div>

            <div className="space-y-6">
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle>Ваш заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedItems.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Выберите товары слева, чтобы оформить заказ.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedItems.map((it) => (
                        <li key={it.product.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="min-w-0 flex-1 truncate text-[var(--color-foreground)]">
                            {it.product.name} × {it.quantity}
                          </span>
                          <span className="shrink-0 text-[var(--color-muted-foreground)]">
                            {formatPrice(it.product.price * it.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                    <span className="text-sm text-[var(--color-muted-foreground)]">Итого</span>
                    <span className="font-heading text-2xl font-bold grad-text">{formatPrice(total)}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || selectedItems.length === 0}
                  >
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