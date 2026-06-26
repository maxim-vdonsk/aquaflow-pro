import { db } from "./db";
import { products } from "./schema";

const seedProducts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    slug: "voda-19l",
    name: "Вода питьевая 19 л",
    description: "Очищенная артезианская вода в многооборотной бутыли.",
    price: 25000,
    image: null,
    volume: "19 л",
    inStock: true,
    category: "water" as const,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    slug: "voda-19l-premium",
    name: "Вода Premium 19 л",
    description: "Глубинная вода с мягким вкусом.",
    price: 35000,
    image: null,
    volume: "19 л",
    inStock: true,
    category: "water" as const,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    slug: "kulery",
    name: "Настольный кулер",
    description: "Компактный кулер с нагревом и охлаждением.",
    price: 499000,
    image: null,
    volume: null,
    inStock: true,
    category: "cooler" as const,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    slug: "pompa",
    name: "Помпа механическая",
    description: "Удобная помпа для бутыли.",
    price: 9900,
    image: null,
    volume: null,
    inStock: true,
    category: "pump" as const,
  },
];

async function main() {
  await db.insert(products).values(seedProducts).onConflictDoNothing();
  console.log("Products seeded");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
