import { z } from "zod";
import { db, products, orders, orderItems, eq, desc, sql } from "@aquaflow/database";
import { demoProducts } from "./demo.js";

export const toolDefinitions = [
  {
    name: "list_products",
    description: "List all water delivery products available in the catalog.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_product",
    description: "Get details of a specific product by slug or ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "Product UUID" },
        slug: { type: "string", description: "Product slug" },
      },
    },
  },
  {
    name: "create_order",
    description: "Create a new water delivery order.",
    inputSchema: {
      type: "object" as const,
      properties: {
        userId: { type: "string", description: "User ID" },
        items: {
          type: "array",
          description: "List of order items",
          items: {
            type: "object",
            properties: {
              productId: { type: "string" },
              quantity: { type: "number" },
            },
            required: ["productId", "quantity"],
          },
        },
        address: { type: "string", description: "Delivery address" },
        scheduledAt: {
          type: "string",
          description: "ISO 8601 delivery date/time",
        },
      },
      required: ["userId", "items", "address", "scheduledAt"],
    },
  },
  {
    name: "list_orders",
    description: "List recent orders.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Maximum number of orders", default: 20 },
        status: { type: "string", description: "Filter by order status" },
      },
    },
  },
  {
    name: "update_order_status",
    description: "Update the status of an order.",
    inputSchema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string" },
        status: {
          type: "string",
          enum: ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"],
        },
      },
      required: ["orderId", "status"],
    },
  },
  {
    name: "get_analytics",
    description: "Get simple analytics: order count and total revenue.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
];

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function handleTool(name: string, args: unknown) {
  switch (name) {
    case "list_products": {
      const rows = await safeQuery(
        () => db.query.products.findMany(),
        demoProducts
      );
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(rows, null, 2) },
        ],
      };
    }

    case "get_product": {
      const { id, slug } = args as { id?: string; slug?: string };
      let row = null;
      if (id) {
        row = await safeQuery(() => db.query.products.findFirst({ where: eq(products.id, id) }), null);
      }
      if (!row && slug) {
        row = await safeQuery(
          () => db.query.products.findFirst({ where: eq(products.slug, slug) }),
          null
        );
      }
      if (!row) {
        row = demoProducts.find((p) => p.id === id || p.slug === slug) || null;
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(row, null, 2) }],
      };
    }

    case "create_order": {
      const schema = z.object({
        userId: z.string(),
        items: z.array(z.object({ productId: z.string(), quantity: z.number().min(1) })),
        address: z.string(),
        scheduledAt: z.string().datetime(),
      });
      const parsed = schema.safeParse(args);
      if (!parsed.success) {
        return {
          content: [{ type: "text" as const, text: `Invalid input: ${parsed.error.message}` }],
          isError: true,
        };
      }
      const { userId, items, scheduledAt } = parsed.data;
      let total = 0;
      for (const item of items) {
        const product = demoProducts.find((p) => p.id === item.productId);
        if (product) total += product.price * item.quantity;
      }

      try {
        const [order] = await db
          .insert(orders)
          .values({
            userId,
            status: "pending",
            total,
            scheduledAt: new Date(scheduledAt),
            paymentStatus: "pending",
          })
          .returning({ id: orders.id });

        await db.insert(orderItems).values(
          items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: demoProducts.find((p) => p.id === item.productId)?.price || 0,
          }))
        );

        return {
          content: [
            { type: "text" as const, text: `Order created: ${order.id} for ${total / 100} RUB` },
          ],
        };
      } catch {
        const orderId = `demo-${Math.random().toString(36).slice(2, 10)}`;
        return {
          content: [
            {
              type: "text" as const,
              text: `Demo order created: ${orderId} for ${total / 100} RUB (DB unavailable)`,
            },
          ],
        };
      }
    }

    case "list_orders": {
      const { limit = 20, status } = args as { limit?: number; status?: string };
      const rows = await safeQuery(
        () =>
          db.query.orders.findMany({
            where: status ? eq(orders.status, status as any) : undefined,
            orderBy: [desc(orders.createdAt)],
            limit,
          }),
        []
      );
      return {
        content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }],
      };
    }

    case "update_order_status": {
      const { orderId, status } = args as { orderId: string; status: string };
      try {
        await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
        return {
          content: [{ type: "text" as const, text: `Order ${orderId} updated to ${status}` }],
        };
      } catch {
        return {
          content: [
            { type: "text" as const, text: `Demo: order ${orderId} status would update to ${status}` },
          ],
        };
      }
    }

    case "get_analytics": {
      const result = await safeQuery(
        async () => {
          const [row] = await db
            .select({
              count: sql<number>`count(*)::int`,
              revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)::int`,
            })
            .from(orders);
          return row;
        },
        { count: 0, revenue: 0 }
      );
      return {
        content: [
          {
            type: "text" as const,
            text: `Orders: ${result.count}, Revenue: ${result.revenue / 100} RUB`,
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}
