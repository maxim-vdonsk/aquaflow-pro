BEGIN;
ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_user_id_fk";
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_products_id_fk";
ALTER TABLE "order_items" ALTER COLUMN "product_id" TYPE text USING product_id::text;
COMMIT;
