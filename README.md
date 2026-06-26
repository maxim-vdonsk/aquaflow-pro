# AquaFlow Pro — Платформа доставки воды

Готовый к production сайт доставки питьевой воды: лендинг, каталог, оформление заказа, личный кабинет, панель администратора, аутентификация Better Auth, MCP-сервер, Docker.

**AquaFlow Pro — Water Delivery Platform**

Production-ready water delivery website: landing, catalog, checkout, account dashboard, admin panel, Better Auth, MCP server, Docker.

## Стек технологий / Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, React Three Fiber, next-themes
- **Backend:** Next.js Server Actions, Better Auth, Drizzle ORM, PostgreSQL, Redis
- **Дизайн:** кибер-тёмная тема с неоновыми акцентами (cyan / pink / yellow), glassmorphism, анимированные переходы
- **Интеграции:** Telegram Login Widget, FastAPI бот доставки воды, email-верификация
- **Инфраструктура:** Docker Compose, pnpm workspaces, Turbo

## Структура проекта / Project Structure

```
.
├── apps/
│   ├── web/              # Next.js 15: маркетинг + личный кабинет
│   └── mcp/              # MCP-сервер (stdio)
├── packages/
│   └── database/         # Drizzle ORM: схема + миграции
├── docker-compose.yml
└── README.md
```

## Быстрый старт / Quick Start (local)

```bash
# 1. Установить зависимости
pnpm install

# 2. Скопировать файл окружения
cp .env.example .env

# 3. Запустить Postgres + Redis
docker compose up -d db redis

# 4. Выполнить миграции и наполнить базу
pnpm --filter @aquaflow/database migrate
pnpm --filter @aquaflow/database seed

# 5. Запустить веб-приложение в режиме разработки
pnpm --filter @aquaflow/web dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Полный Docker-стек / Full Docker Stack

```bash
cp .env.example .env
docker compose up --build
```

Запускается веб-приложение (порт 3000), MCP-сервер, Postgres и Redis.

## Интеграция с Telegram-ботом / Bot Integration

Сайт умеет отправлять заказы в API водочного Telegram-бота и синхронизировать каталог воды.

Переменные окружения в `.env`:

```env
BOT_API_URL=http://127.0.0.1:8001
BOT_API_TOKEN=<токен из таблицы api_tokens бота>
TELEGRAM_BOT_TOKEN=<токен от @BotFather>
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=<username бота без @>
NEXT_PUBLIC_SHOW_TELEGRAM_LOGIN=true
```

## MCP-сервер / MCP Server

MCP-сервер предоставляет инструменты для внешних AI-агентов:

- `list_products`
- `get_product`
- `create_order`
- `list_orders`
- `update_order_status`
- `get_analytics`

Локальный запуск:

```bash
pnpm --filter @aquaflow/mcp start
```

Подключение через stdio к любому MCP-клиенту:

```json
{
  "command": "pnpm",
  "args": ["--filter", "@aquaflow/mcp", "start"]
}
```

## Скрипты / Scripts

| Скрипт | Описание |
|--------|----------|
| `pnpm dev` | Запустить все dev-серверы |
| `pnpm build` | Собрать web + mcp |
| `pnpm typecheck` | Проверить типы во всех пакетах |
| `pnpm --filter @aquaflow/database generate` | Сгенерировать миграции Drizzle |
| `pnpm --filter @aquaflow/database migrate` | Применить миграции |
| `pnpm --filter @aquaflow/database seed` | Заполнить базу товарами |
| `pnpm --filter @aquaflow/database studio` | Drizzle Studio |

## Примечания / Notes

- Форма заказа работает без авторизации в демо-режиме. Если база недоступна, возвращается демо-ответ.
- Аутентификация через Better Auth по адресу `/api/auth/*`. Защищённые маршруты перенаправляют на `/login` при отсутствии сессии.
- OAuth-провайдеры можно добавить в `apps/web/lib/auth.ts` после заполнения credentials в `.env`.
- Email-верификация по умолчанию логирует ссылку в консоль. Для реальной отправки подключите SMTP в `apps/web/lib/auth.ts`.
