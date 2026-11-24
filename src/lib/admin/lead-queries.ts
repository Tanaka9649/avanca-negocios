import "server-only";
import { and, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";
import { requireDb } from "@/db";
import { businessUsers, leads } from "@/db/schema";
import { LEAD_CATEGORIES, LEAD_STATUSES, type LeadCategory, type LeadStatus } from "@/lib/admin/labels";

export type LeadFilters = { q?: string; categoria?: LeadCategory; status?: LeadStatus; responsavel?: string };

export function parseLeadFilters(sp: Record<string, string | string[] | undefined>): LeadFilters {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const categoria = one("categoria");
  const status = one("status");
  return {
    q: one("q")?.trim().slice(0, 100) || undefined,
    categoria: (LEAD_CATEGORIES as readonly string[]).includes(categoria ?? "") ? (categoria as LeadCategory) : undefined,
    status: (LEAD_STATUSES as readonly string[]).includes(status ?? "") ? (status as LeadStatus) : undefined,
    responsavel: one("responsavel") || undefined,
  };
}

export async function listLeads(f: LeadFilters, limit = 500) {
  const where: SQL[] = [];
  if (f.categoria) where.push(eq(leads.category, f.categoria));
  if (f.status) where.push(eq(leads.status, f.status));
  if (f.responsavel === "sem") where.push(isNull(leads.assignedTo));
  else if (f.responsavel && /^[0-9a-f-]{36}$/.test(f.responsavel)) where.push(eq(leads.assignedTo, f.responsavel));
  if (f.q) {
    const term = `%${f.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    const digits = f.q.replace(/\D/g, "");
    const conds = [ilike(leads.name, term), ilike(leads.email, term), ilike(leads.city, term)];
    if (digits.length >= 4) conds.push(ilike(leads.whatsapp, `%${digits}%`));
    where.push(or(...conds)!);
  }
  return requireDb()
    .select({
      id: leads.id, category: leads.category, status: leads.status, source: leads.source, name: leads.name, whatsapp: leads.whatsapp,
      email: leads.email, city: leads.city, state: leads.state, details: leads.details, message: leads.message,
      nextAction: leads.nextAction, nextActionAt: leads.nextActionAt, createdAt: leads.createdAt, updatedAt: leads.updatedAt,
      utmSource: leads.utmSource, utmMedium: leads.utmMedium, utmCampaign: leads.utmCampaign,
      assignedName: businessUsers.name,
    })
    .from(leads)
    .leftJoin(businessUsers, eq(businessUsers.id, leads.assignedTo))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}

export async function listTeam() {
  return requireDb().select({ id: businessUsers.id, name: businessUsers.name }).from(businessUsers).where(eq(businessUsers.status, "ativo")).orderBy(businessUsers.name);
}
