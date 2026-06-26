import Link from "next/link";

const links = {
  company: [
    { href: "/about", label: "О нас" },
    { href: "/contacts", label: "Контакты" },
    { href: "/catalog", label: "Каталог" },
  ],
  client: [
    { href: "/account", label: "Личный кабинет" },
    { href: "/order", label: "Оформить заказ" },
    { href: "/#faq", label: "FAQ" },
  ],
  legal: [
    { href: "/privacy", label: "Политика конфиденциальности" },
    { href: "/terms", label: "Условия использования" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background-2)] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-[var(--color-foreground)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M12 6C10 10 8 12 8 14C8 16.2091 9.79086 18 12 18C14.2091 18 16 16.2091 16 14C16 12 14 10 12 6Z" fill="currentColor" />
                </svg>
              </span>
              <span className="font-heading tracking-tight">
                Aqua<span className="grad-text">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Доставка питьевой воды и оборудования. Чисто, быстро, удобно.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Компания
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
              {links.company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href as any} className="transition-colors hover:text-[var(--color-primary)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Клиентам
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
              {links.client.map((l) => (
                <li key={l.href}>
                  <Link href={l.href as any} className="transition-colors hover:text-[var(--color-primary)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Правовая информация
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
              {links.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href as any} className="transition-colors hover:text-[var(--color-primary)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-center font-mono text-sm text-[var(--color-muted-foreground)]">
          © {new Date().getFullYear()} AquaFlow. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
