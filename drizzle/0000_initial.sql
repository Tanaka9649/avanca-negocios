CREATE TYPE "public"."event_status" AS ENUM('agendado', 'vagas_limitadas', 'encerrado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."lead_category" AS ENUM('eventos', 'networking', 'compra_empresa', 'venda_empresa', 'institucional');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('formulario', 'whatsapp', 'manual');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('novo', 'contato_realizado', 'em_qualificacao', 'reuniao_agendada', 'em_negociacao', 'concluido', 'perdido');--> statement-breakpoint
CREATE TYPE "public"."business_user_role" AS ENUM('admin', 'gestor', 'atendimento', 'editor');--> statement-breakpoint
CREATE TYPE "public"."business_user_status" AS ENUM('ativo', 'suspenso');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"changes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "business_user_role" DEFAULT 'atendimento' NOT NULL,
	"status" "business_user_status" DEFAULT 'ativo' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"lead_id" uuid,
	"channel" text DEFAULT 'whatsapp' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"location_name" text,
	"address" text,
	"city" text DEFAULT 'Frutal/MG' NOT NULL,
	"image_url" text,
	"image_alt" text,
	"status" "event_status" DEFAULT 'agendado' NOT NULL,
	"published_at" timestamp with time zone,
	"capacity" integer,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutional_content" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"author_id" uuid,
	"kind" text NOT NULL,
	"body" text,
	"from_status" "lead_status",
	"to_status" "lead_status",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "lead_category" NOT NULL,
	"status" "lead_status" DEFAULT 'novo' NOT NULL,
	"source" "lead_source" DEFAULT 'formulario' NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text,
	"city" text,
	"state" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"message" text,
	"event_id" uuid,
	"assigned_to" uuid,
	"next_action" text,
	"next_action_at" timestamp with time zone,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"referrer" text,
	"landing_path" text,
	"consent_at" timestamp with time zone,
	"consent_version" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participating_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"segment" text,
	"logo_url" text,
	"instagram" text,
	"website" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context" text NOT NULL,
	"path" text,
	"event_id" uuid,
	"utm_source" text,
	"utm_campaign" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_business_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."business_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_sessions" ADD CONSTRAINT "business_sessions_user_id_business_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."business_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_updated_by_business_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."business_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_interests" ADD CONSTRAINT "event_interests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_interests" ADD CONSTRAINT "event_interests_lead_id_business_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."business_leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_business_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."business_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institutional_content" ADD CONSTRAINT "institutional_content_updated_by_business_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."business_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interactions" ADD CONSTRAINT "lead_interactions_lead_id_business_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."business_leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interactions" ADD CONSTRAINT "lead_interactions_author_id_business_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."business_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_leads" ADD CONSTRAINT "business_leads_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_leads" ADD CONSTRAINT "business_leads_assigned_to_business_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."business_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_clicks" ADD CONSTRAINT "whatsapp_clicks_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "business_sessions_token_uq" ON "business_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "business_sessions_user_idx" ON "business_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_users_email_uq" ON "business_users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "event_interests_event_idx" ON "event_interests" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_uq" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_public_idx" ON "events" USING btree ("published_at","starts_at");--> statement-breakpoint
CREATE INDEX "lead_interactions_lead_idx" ON "lead_interactions" USING btree ("lead_id","created_at");--> statement-breakpoint
CREATE INDEX "business_leads_category_status_idx" ON "business_leads" USING btree ("category","status");--> statement-breakpoint
CREATE INDEX "business_leads_created_idx" ON "business_leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "business_leads_assigned_idx" ON "business_leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "participating_companies_order_idx" ON "participating_companies" USING btree ("active","sort_order");--> statement-breakpoint
CREATE INDEX "whatsapp_clicks_created_idx" ON "whatsapp_clicks" USING btree ("created_at");