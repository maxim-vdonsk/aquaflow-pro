ALTER TABLE "user" ADD COLUMN "telegram_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_telegram_id_unique" UNIQUE("telegram_id");