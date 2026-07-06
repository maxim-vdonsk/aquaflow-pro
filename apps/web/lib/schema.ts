import { z } from "zod";

// Contacts + delivery part of the order (used by the order form).
// Cart items are validated separately in app/actions/order.ts because they
// arrive as a JSON-encoded FormData field (array of {productId, quantity}).
export const orderSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{10,}$/, "Введите корректный телефон"),
  address: z.string().min(5, "Укажите адрес доставки"),
  apartment: z.string().optional(),
  floor: z.string().optional(),
  scheduledAt: z.string().min(1, "Выберите дату доставки"),
  comment: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

// Single cart line, validated server-side in the action.
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Выберите продукт"),
  quantity: z.coerce.number().min(1, "Минимум 1").max(50, "Максимум 50"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;