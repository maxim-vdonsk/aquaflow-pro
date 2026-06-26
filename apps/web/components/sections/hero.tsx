"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Droplets,
  ChevronRight,
  Phone,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MagneticButton } from "@/components/magnetic-button";
import { products as staticProducts, type Product } from "@/lib/data";
import type { MappedProduct } from "@/lib/bot-water-map";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/app/actions/order";

const WaterScene = dynamic(
  () => import("@/components/water-scene").then((mod) => mod.WaterScene),
  { ssr: false }
);

export function Hero({
  products: catalogProducts,
}: {
  products?: MappedProduct[];
}) {
  const products = catalogProducts?.length ? catalogProducts : staticProducts;
  const [selected, setSelected] = React.useState<Product | MappedProduct>(
    products.find((p) => p.category === "water") || products[0]
  );
  const [quantity, setQuantity] = React.useState(2);
  const [address, setAddress] = React.useState("");
  const [date, setDate] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [floor, setFloor] = React.useState("");
  const [result, setResult] = React.useState<
    Awaited<ReturnType<typeof createOrder>> | null
  >(null);
  const [submitting, setSubmitting] = React.useState(false);
  const total = selected.price * quantity;

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("apartment", apartment);
    formData.append("floor", floor);
    formData.append("productId", selected.id);
    formData.append("quantity", String(quantity));
    formData.append("scheduledAt", date);
    const res = await createOrder(formData);
    setResult(res);
    setSubmitting(false);
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <WaterScene />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <div className="hero-badge mb-6 w-fit">
            <span className="pulse-dot" />
            Доставка за 2 часа по городу
          </div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
            }}
            className="font-heading text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <motion.span
              className="line-reveal"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
              }}
            >
              <span className="grad-text">Чистая вода</span>
            </motion.span>
            <motion.span
              className="line-reveal"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
              }}
            >
              у вас домой
            </motion.span>
            <motion.span
              className="line-reveal"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
              }}
            >
              <span className="grad-text">за 2 часа</span>
            </motion.span>
          </motion.h1>

          <p className="mt-6 max-w-lg text-lg text-[var(--color-muted-foreground)]">
            AquaFlow привозит сертифицированную питьевую воду в бутылях 19 л, кулеры и аксессуары.
            Настройте подписку и забудьте о перебоях.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="hero-badge">
              <span className="text-[var(--color-primary)]"><Droplets className="h-3.5 w-3.5" /></span>
              Бутыли 19 л
            </span>
            <span className="hero-badge">
              <span className="text-[var(--color-accent)]">●</span>
              Кулеры и помпы
            </span>
            <span className="hero-badge">
              <span className="text-[var(--color-yellow)]">●</span>
              Подписка
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <MagneticButton asChild>
              <Button size="lg" variant="default" asChild className="group">
                <a href="#calculator">
                  Рассчитать заказ
                  <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </MagneticButton>
            <MagneticButton asChild>
              <Button size="lg" variant="outline" asChild>
                <a href="/catalog">Смотреть каталог</a>
              </Button>
            </MagneticButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          id="calculator"
        >
          <Card className="border-[var(--color-border)] bg-[rgba(6,9,18,0.6)] text-[var(--color-card-foreground)] shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 p-6 sm:p-8">
                <h2 className="font-heading text-2xl font-semibold">Быстрый заказ</h2>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-muted-foreground)]">Выберите воду</label>
                  <div className="grid grid-cols-2 gap-2">
                    {products
                      .filter((p) => p.category === "water")
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelected(p)}
                          className={`rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition-colors ${
                            selected.id === p.id
                              ? "border-[var(--color-primary)] bg-[rgba(125,249,255,0.12)] text-[var(--color-primary)] shadow-[0_0_20px_rgba(125,249,255,0.15)]"
                              : "border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] text-[var(--color-foreground)] hover:bg-[rgba(255,255,255,0.07)]"
                          }`}
                        >
                          {p.name}
                          <div className="mt-1 text-xs opacity-80">{formatPrice(p.price)}/бутыль</div>
                        </button>
                      ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="qty" className="text-sm font-medium text-[var(--color-muted-foreground)]">Количество</label>
                    <Input
                      id="qty"
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(2, Number(e.target.value)))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-[var(--color-muted-foreground)]">Дата доставки</label>
                    <Input id="date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="hero-name" className="text-sm font-medium text-[var(--color-muted-foreground)]">Имя</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                      <Input
                        id="hero-name"
                        placeholder="Иван Иванов"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="hero-phone" className="text-sm font-medium text-[var(--color-muted-foreground)]">Телефон</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                      <Input
                        id="hero-phone"
                        type="tel"
                        placeholder="+7 999 123-45-67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="hero-address" className="text-sm font-medium text-[var(--color-muted-foreground)]">Адрес</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                    <Input
                      id="hero-address"
                      placeholder="ул. Примерная, 12"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="hero-apartment" className="text-sm font-medium text-[var(--color-muted-foreground)]">Квартира</label>
                    <Input
                      id="hero-apartment"
                      placeholder="5"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="hero-floor" className="text-sm font-medium text-[var(--color-muted-foreground)]">Этаж</label>
                    <Input
                      id="hero-floor"
                      placeholder="3"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                    />
                  </div>
                </div>

                {result && (
                  <p
                    className={`text-sm ${
                      result.success
                        ? "text-emerald-400"
                        : "text-[var(--color-destructive)]"
                    }`}
                  >
                    {result.message}
                  </p>
                )}

                <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.04)] p-4">
                  <div className="space-y-1">
                    <div className="text-sm text-[var(--color-muted-foreground)]">Итого к оплате</div>
                    <div className="font-heading text-2xl font-bold grad-text">{formatPrice(total)}</div>
                  </div>
                  <Button size="lg" className="gap-2" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                    Заказать
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
