import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/sections/header";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      {/* Same header as the storefront: clickable logo → home, nav, cart,
          user menu with the admin entry for role=admin. */}
      <Header />
      <main className="pt-16">{children}</main>
      <CartDrawer />
    </div>
  );
}