-- Order contacts (also stored for guest orders, enabling later matching
-- from the cabinet by phone). Mirrors packages/database/src/schema.ts.
BEGIN;
ALTER TABLE "orders" ADD COLUMN "contact_name" text;
ALTER TABLE "orders" ADD COLUMN "contact_phone" text;
ALTER TABLE "orders" ADD COLUMN "contact_address" text;
COMMIT;