import { sql } from "drizzle-orm";
import {
  boolean, customType, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const userRole = pgEnum("business_user_role", ["admin", "gestor", "atendimento", "editor"]);
export const userStatus = pgEnum("business_user_status", ["ativo", "suspenso"]);

export const leadCategory = pgEnum("lead_category", [
  "eventos", "networking", "compra_empresa", "venda_empresa", "institucional",
]);

export const leadStatus = pgEnum("lead_status", [
  "novo", "contato_realizado", "em_qualificacao", "reuniao_agendada", "em_negociacao", "concluido", "perdido",
]);

export const leadSource = pgEnum("lead_source", ["formulario", "whatsapp", "manual"]);

export const eventStatus = pgEnum("event_status", ["agendado", "vagas_limitadas", "encerrado", "cancelado"]);

// Usuários do painel Avança Negócios. Não compartilham nada com os usuários da plataforma imobiliária.
export const businessUsers = pgTable("business_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("atendimento"),
  status: userStatus("status").notNull().default("ativo"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [uniqueIndex("business_users_email_uq").on(sql`lower(${t.email})`)]);

export const businessSessions = pgTable("business_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => businessUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("business_sessions_token_uq").on(t.tokenHash),
  index("business_sessions_user_idx").on(t.userId),
]);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  locationName: text("location_name"),
  address: text("address"),
  city: text("city").notNull().default("Frutal/MG"),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  status: eventStatus("status").notNull().default("agendado"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  // Reservado para inscrições futuras (vagas, pagamento, check-in). Não usado na primeira versão.
  capacity: integer("capacity"),
  createdBy: uuid("created_by").references(() => businessUsers.id, { onDelete: "set null" }),
  ...timestamps,
}, (t) => [
  uniqueIndex("events_slug_uq").on(t.slug),
  index("events_public_idx").on(t.publishedAt, t.startsAt),
]);

export const leads = pgTable("business_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: leadCategory("category").notNull(),
  status: leadStatus("status").notNull().default("novo"),
  source: leadSource("source").notNull().default("formulario"),
  name: text("name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  email: text("email"),
  city: text("city"),
  state: text("state"),
  // Campos específicos de cada formulário (segmento, faixa de faturamento, objetivo etc.).
  details: jsonb("details").$type<Record<string, string>>().notNull().default({}),
  message: text("message"),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "set null" }),
  assignedTo: uuid("assigned_to").references(() => businessUsers.id, { onDelete: "set null" }),
  nextAction: text("next_action"),
  nextActionAt: timestamp("next_action_at", { withTimezone: true }),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  referrer: text("referrer"),
  landingPath: text("landing_path"),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  consentVersion: text("consent_version"),
  ipHash: text("ip_hash"),
  ...timestamps,
}, (t) => [
  index("business_leads_category_status_idx").on(t.category, t.status),
  index("business_leads_created_idx").on(t.createdAt),
  index("business_leads_assigned_idx").on(t.assignedTo),
]);

export const leadInteractions = pgTable("lead_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => businessUsers.id, { onDelete: "set null" }),
  kind: text("kind").notNull(), // nota | status | contato | atribuicao
  body: text("body"),
  fromStatus: leadStatus("from_status"),
  toStatus: leadStatus("to_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("lead_interactions_lead_idx").on(t.leadId, t.createdAt)]);

// Cliques no botão de interesse de um evento (atendimento segue pelo WhatsApp). Sem dados pessoais.
export const eventInterests = pgTable("event_interests", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  channel: text("channel").notNull().default("whatsapp"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("event_interests_event_idx").on(t.eventId)]);

export const whatsappClicks = pgTable("whatsapp_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  context: text("context").notNull(), // eventos | venda | compra | institucional
  path: text("path"),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "set null" }),
  utmSource: text("utm_source"),
  utmCampaign: text("utm_campaign"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("whatsapp_clicks_created_idx").on(t.createdAt)]);

export const participatingCompanies = pgTable("participating_companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  segment: text("segment"),
  logoUrl: text("logo_url"),
  instagram: text("instagram"),
  website: text("website"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
}, (t) => [index("participating_companies_order_idx").on(t.active, t.sortOrder)]);

// Textos e fotos editáveis pelo painel (biografia da Fernanda, cargos, contatos, redes sociais).
export const institutionalContent = pgTable("institutional_content", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedBy: uuid("updated_by").references(() => businessUsers.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const businessSettings = pgTable("business_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedBy: uuid("updated_by").references(() => businessUsers.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => businessUsers.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("audit_logs_entity_idx").on(t.entity, t.entityId), index("audit_logs_created_idx").on(t.createdAt)]);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

const bytea = customType<{ data: Buffer; driverData: string | Buffer | Uint8Array }>({
  dataType: () => "bytea",
  toDriver: (v) => `\\x${v.toString("hex")}`,
  fromDriver: (v) => (Buffer.isBuffer(v) ? v : v instanceof Uint8Array ? Buffer.from(v) : Buffer.from(String(v).replace(/^\\x/, ""), "hex")),
});

// Imagens enviadas pelo painel (divulgação de eventos, logos, foto institucional), já otimizadas em WebP.
// O Neon Object Storage não está disponível na região de São Paulo; o volume previsto é pequeno.
export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentType: text("content_type").notNull(),
  bytes: bytea("bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  size: integer("size").notNull(),
  purpose: text("purpose").notNull(), // evento | empresa | institucional
  createdBy: uuid("created_by").references(() => businessUsers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
