export interface DemoProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  volume: string | null;
  image: string | null;
  category: "water" | "cooler" | "pump" | "accessory";
  inStock: boolean;
  createdAt: Date;
}

export const demoProducts: DemoProduct[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    slug: "voda-19l",
    name: "Вода питьевая 19 л",
    description: "Очищенная артезианская вода в многооборотной бутыли.",
    price: 25000,
    volume: "19 л",
    image: null,
    category: "water",
    inStock: true,
    createdAt: new Date("2026-06-25T00:00:00Z"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    slug: "voda-19l-premium",
    name: "Вода Premium 19 л",
    description: "Глубинная вода с мягким вкусом.",
    price: 35000,
    volume: "19 л",
    image: null,
    category: "water",
    inStock: true,
    createdAt: new Date("2026-06-25T00:00:00Z"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    slug: "kulery",
    name: "Настольный кулер",
    description: "Компактный кулер с нагревом и охлаждением.",
    price: 499000,
    volume: "—",
    image: null,
    category: "cooler",
    inStock: true,
    createdAt: new Date("2026-06-25T00:00:00Z"),
  },
];
