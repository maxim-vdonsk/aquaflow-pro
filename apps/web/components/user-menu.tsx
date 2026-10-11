"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, ShieldCheck, User } from "lucide-react";

/**
 * User menu in the site header. GitHub-style: the admin panel is a menu
 * entry on the same logged-in account, never a separate login "mode".
 * Renders the plain cabinet button when logged out, so callers can drop
 * it in place of the old "Личный кабинет" button.
 */
export function UserMenu({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const user = session?.user;
  const userName = user?.name || user?.email || "";
  // role rides the session via user.additionalFields in lib/auth.ts
  const isAdmin = (user as { role?: string } | undefined)?.role === "admin";

  const signOut = () => {
    authClient.signOut().then(() => {
      window.location.href = "/";
    });
  };

  const adminLink = (
    <Link
      href="/admin"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-foreground)] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
      onClick={variant === "desktop" ? () => setOpen(false) : undefined}
    >
      <ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" />
      Панель заявок
    </Link>
  );

  if (variant === "mobile") {
    if (!user) {
      // Same place as the old static cabinet button.
      return (
        <Button asChild variant="outline">
          <Link href="/account" onClick={() => setOpen(false)}>
            Личный кабинет
          </Link>
        </Button>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-sm font-bold text-black">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span className="truncate text-sm font-medium">{userName}</span>
        </div>
        <Button asChild variant="outline">
          <Link href="/account" onClick={() => setOpen(false)}>
            Личный кабинет
          </Link>
        </Button>
        {isAdmin && adminLink}
        <Button variant="ghost" className="justify-start" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <Button size="sm" variant="outline" disabled className="rounded-full border-[var(--color-border-hi)]">
        <span className="inline-block h-4 w-16 rounded bg-[rgba(255,255,255,0.15)]" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline" className="rounded-full border-[var(--color-border-hi)]">
        <Link href="/account">Личный кабинет</Link>
      </Button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border-hi)] py-1 pl-1.5 pr-2.5 text-foreground transition-colors hover:bg-[rgba(255,255,255,0.06)]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-xs font-bold text-black">
          {userName.slice(0, 1).toUpperCase()}
        </span>
        <span className="max-w-[120px] truncate text-sm font-medium">{userName}</span>
        <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[rgba(3,5,10,0.97)] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-[20px]"
          >
            <div className="border-b border-[var(--color-border)] px-3 py-2">
              <div className="truncate text-sm font-medium">{userName}</div>
              <div className="truncate text-xs text-[var(--color-muted-foreground)]">{user?.email}</div>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              Личный кабинет
            </Link>
            {isAdmin && adminLink}
            <div className="mt-1 border-t border-[var(--color-border)] pt-1.5">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-muted-foreground)] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-foreground)]"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}