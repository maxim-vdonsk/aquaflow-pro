ALTER TABLE "user" ADD COLUMN "client_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_client_id_unique" UNIQUE("client_id");
