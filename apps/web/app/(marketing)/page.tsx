import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/stats";
import { Marquee } from "@/components/marquee";
import { Features } from "@/components/sections/features";
import { CatalogPreview } from "@/components/sections/catalog-preview";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";
import { getCatalogProducts } from "@/lib/catalog";

const marqueeItems = [
  "Чистая вода 19 л",
  "Доставка за 2 часа",
  "Кулеры и помпы",
  "Без залога за тару",
  "Подписка на доставку",
  "Поддержка 24/7",
];

export default async function HomePage() {
  const catalog = await getCatalogProducts();

  return (
    <>
      <Hero products={catalog} />
      <Stats />
      <Marquee items={marqueeItems} />
      <Features />
      <CatalogPreview products={catalog} />
      <Testimonials />
      <Faq />
      <Cta />
    </>
  );
}
