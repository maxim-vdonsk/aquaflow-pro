"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";

const nav = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/cart", label: "Корзина" },
  { href: "/order", label: "Заказ" },
  { href: "/about", label: "О нас" },
];

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[rgba(3,5,10,0.7)] backdrop-blur-[20px] saturate-[180%] border-[var(--color-border)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-[var(--color-foreground)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-black shadow-[0_0_24px_rgba(125,249,255,0.35)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
              <path d="M12 6C10 10 8 12 8 14C8 16.2091 9.79086 18 12 18C14.2091 18 16 16.2091 16 14C16 12 14 10 12 6Z" fill="currentColor" />
            </svg>
          </span>
          <span className="font-heading tracking-tight">
            Aqua<span className="grad-text">Flow</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href as any}
              className="nav-link text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CartButton variant="full" />
          <Button asChild size="sm" variant="outline" className="rounded-full border-[var(--color-border-hi)]">
            <Link href="/account">Личный кабинет</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/order">Заказать →</Link>
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-b border-[var(--color-border)] bg-[rgba(3,5,10,0.97)] backdrop-blur-[24px] md:hidden"
          >
            <nav className="flex flex-col gap-2 px-4 py-6">
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                >
                  <Link
                    href={item.href as any}
                    className="block rounded-lg px-3 py-3 text-lg font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--color-foreground)]"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <CartButton variant="compact" className="flex-1 justify-center" />
                </div>
                <Button asChild variant="outline">
                  <Link href="/account" onClick={() => setOpen(false)}>Личный кабинет</Link>
                </Button>
                <Button asChild>
                  <Link href="/order" onClick={() => setOpen(false)}>Заказать →</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
