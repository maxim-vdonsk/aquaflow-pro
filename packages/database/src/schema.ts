import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);
export const subscriptionFrequencyEnum = pgEnum("subscription_frequency", [
  "weekly",
  "biweekly",
  "monthly",
]);
export const productCategoryEnum = pgEnum("product_category", [
  "water",
  "cooler",
  "pump",
  "accessory",
]);

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  city: varchar("city", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  apartment: varchar("apartment", { length: 50 }),
  entrance: varchar("entrance", { length: 50 }),
  floor: varchar("floor", { length: 50 }),
  comment: text("comment"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // cents
  image: varchar("image", { length: 512 }),
  volume: varchar("volume", { length: 50 }),
  inStock: boolean("in_stock").default(true).notNull(),
  category: productCategoryEnum("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    // nullable + ON DELETE SET NULL: guest orders (no session) have no user
    // row. Keep the FK so authenticated orders still cascade-cleanup on
    // account deletion, but allow null for walk-in site orders.
    .references(() => user.id, { onDelete: "set null" }),
  status: orderStatusEnum("status").default("pending").notNull(),
  total: integer("total").notNull(),
  addressId: uuid("address_id").references(() => addresses.id, { onDelete: "set null" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    // text (no FK): the bot's catalog exposes water_type ("water1"…) as the
    // product id; static catalog uses uuid. Both must round-trip as a plain
    // string snapshot of what was ordered.
    .notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // snapshot price in cents
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  frequency: subscriptionFrequencyEnum("frequency").notNull(),
  nextDeliveryAt: timestamp("next_delivery_at", { withTimezone: true }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  text: text("text"),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
