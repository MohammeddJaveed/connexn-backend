ALTER TABLE "regions" DROP CONSTRAINT "regions_name_key";--> statement-breakpoint
ALTER TABLE "regions" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "regions" DROP COLUMN "created_at";