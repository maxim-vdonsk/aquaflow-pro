import { z } from "zod";
import { products } from "@/lib/data";

export const orderSchema = z
  .object({
    name: z.string().min(2, "Укажите имя"),
    phone: z
      .string()
      .regex(/^\+?[\d\s()-]{10,}$/, "Введите корректный телефон"),
    address: z.string().min(5, "Укажите адрес доставки"),
    apartment: z.string().optional(),
    floor: z.string().optional(),
    productId: z.string().min(1, "Выберите продукт"),
    quantity: z.coerce.number().min(1, "Минимум 1").max(50, "Максимум 50"),
    scheduledAt: z.string().min(1, "Выберите дату доставки"),
    comment: z.string().optional(),
  })
  .refine(
    (data) => {
      const product = products.find((p) => p.id === data.productId);
      if (!product || product.category !== "water") return true;
      return data.quantity >= 2;
    },
    {
      message: "Для воды минимальный заказ — 2 бутыли",
      path: ["quantity"],
    }
  );

export type OrderInput = z.infer<typeof orderSchema>;
