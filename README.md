# AquaFlow — Water Delivery Platform

Production-ready water delivery website: landing, catalog, checkout, account dashboard, admin panel, Better Auth, MCP server, Docker.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, React Three Fiber, next-themes
- **Backend:** Next.js Server Actions, Better Auth, Drizzle ORM, PostgreSQL, Redis
- **Design:** `ui-ux-pro-max` generated system — Flat Design, water palette, Rubik + Nunito Sans
- **AI Integration:** MCP server (`@modelcontextprotocol/sdk`) for products, orders and analytics
- **Infra:** Docker Compose, pnpm workspaces, Turbo

## Project Structure

```
.
├── apps/
│   ├── web/              # Next.js 15 marketing + dashboard
│   └── mcp/              # MCP server (stdio)
├── packages/
│   └── database/         # Drizzle ORM schema + migrations
├── docker-compose.yml
└── README.md
```

## Quick Start (local)

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env

# 3. Start Postgres + Redis
docker compose up -d db redis

# 4. Run migrations and seed products
pnpm --filter @aquaflow/database migrate
pnpm --filter @aquaflow/database seed

# 5. Start web app in dev mode
pnpm --filter @aquaflow/web dev
```

Open [http://localhost:3000](http://localhost:3000).

## Full Docker Stack

```bash
cp .env.example .env
docker compose up --build
```

This starts web (port 3000), MCP server, Postgres and Redis.

## MCP Server

The MCP server exposes tools for external AI agents:

- `list_products`
- `get_product`
- `create_order`
- `list_orders`
- `update_order_status`
- `get_analytics`

Run locally:

```bash
pnpm --filter @aquaflow/mcp start
```

Or connect via stdio to any MCP client:

```json
{
  "command": "pnpm",
  "args": ["--filter", "@aquaflow/mcp", "start"]
}
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build web + mcp |
| `pnpm typecheck` | Type-check all packages |
| `pnpm --filter @aquaflow/database generate` | Generate Drizzle migrations |
| `pnpm --filter @aquaflow/database migrate` | Run migrations |
| `pnpm --filter @aquaflow/database seed` | Seed products |
| `pnpm --filter @aquaflow/database studio` | Drizzle Studio |

## Design System

Generated with `ui-ux-pro-max`:

- Style: Flat Design
- Primary: `#0284C7`
- Secondary: `#06B6D4`
- Accent: `#0891B2`
- Background: `#F0F9FF`
- Fonts: Rubik (headings), Nunito Sans (body)

## Notes

- The order form works without auth in demo mode. When the database is unavailable it returns a graceful demo response.
- Auth is handled by Better Auth via `/api/auth/*`. Dashboard routes redirect to `/login` when unauthenticated.
- Add OAuth providers in `apps/web/lib/auth.ts` after setting credentials in `.env`.
