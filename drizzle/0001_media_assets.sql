CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"bytes" "bytea" NOT NULL,
	"width" integer,
	"height" integer,
	"size" integer NOT NULL,
	"purpose" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_business_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."business_users"("id") ON DELETE set null ON UPDATE no action;