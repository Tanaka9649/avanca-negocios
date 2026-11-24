"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb } from "@/db";
import { businessUsers, leadInteractions, leads } from "@/db/schema";
import { audit } from "@/lib/admin/audit";
import { fromLocalInput, LEAD_CATEGORIES, LEAD_STATUSES, phoneDigits } from "@/lib/admin/labels";
import { requireUser } from "@/lib/auth";

const uuid = z.string().uuid();

export async function changeLeadStatus(formData: FormData) {
  const user = await requireUser("leads");
  const id = uuid.parse(formData.get("leadId"));
  const status = z.enum(LEAD_STATUSES).parse(formData.get("status"));
  const db = requireDb();
  const [lead] = await db.select({ status: leads.status }).from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead || lead.status === status) return;
  await db.update(leads).set({ status, updatedAt: new Date() }).where(eq(leads.id, id));
  await db.insert(leadInteractions).values({ leadId: id, authorId: user.id, kind: "status", fromStatus: lead.status, toStatus: status });
  await audit(user.id, "lead.status", "business_leads", id, { from: lead.status, to: status });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

export async function updateLeadFollowUp(formData: FormData) {
  const user = await requireUser("leads");
  const id = uuid.parse(formData.get("leadId"));
  const assigned = String(formData.get("assignedTo") ?? "");
  const assignedTo = assigned ? uuid.parse(assigned) : null;
  const nextAction = String(formData.get("nextAction") ?? "").trim().slice(0, 300) || null;
  const nextActionAt = fromLocalInput(String(formData.get("nextActionAt") ?? ""));
  const db = requireDb();
  const [before] = await db.select({ assignedTo: leads.assignedTo }).from(leads).where(eq(leads.id, id)).limit(1);
  if (!before) return;
  if (assignedTo) {
    const [exists] = await db.select({ id: businessUsers.id }).from(businessUsers).where(eq(businessUsers.id, assignedTo)).limit(1);
    if (!exists) return;
  }
  await db.update(leads).set({ assignedTo, nextAction, nextActionAt, updatedAt: new Date() }).where(eq(leads.id, id));
  if (before.assignedTo !== assignedTo) {
    const [who] = assignedTo ? await db.select({ name: businessUsers.name }).from(businessUsers).where(eq(businessUsers.id, assignedTo)) : [null];
    await db.insert(leadInteractions).values({ leadId: id, authorId: user.id, kind: "atribuicao", body: who ? `Responsável: ${who.name}` : "Responsável removido" });
  }
  await audit(user.id, "lead.follow_up", "business_leads", id, { assignedTo, nextAction, nextActionAt });
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
}

export async function addLeadNote(formData: FormData) {
  const user = await requireUser("leads");
  const id = uuid.parse(formData.get("leadId"));
  const kind = z.enum(["nota", "contato"]).parse(formData.get("kind") ?? "nota");
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!body) return;
  const db = requireDb();
  await db.insert(leadInteractions).values({ leadId: id, authorId: user.id, kind, body });
  await db.update(leads).set({ updatedAt: new Date() }).where(eq(leads.id, id));
  revalidatePath(`/admin/leads/${id}`);
}

const manualSchema = z.object({
  category: z.enum(LEAD_CATEGORIES),
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  whatsapp: z.string().transform(phoneDigits).refine((v) => v.length >= 10 && v.length <= 13, "Informe o WhatsApp com DDD."),
  email: z.string().trim().toLowerCase().max(160).optional().transform((v) => v || undefined).refine((v) => !v || z.string().email().safeParse(v).success, "E-mail inválido."),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().toUpperCase().max(2).optional(),
  message: z.string().trim().max(4000).optional(),
});

export type ManualLeadState = { error?: string } | undefined;

export async function createManualLead(_: ManualLeadState, formData: FormData): Promise<ManualLeadState> {
  const user = await requireUser("leads");
  const parsed = manualSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const db = requireDb();
  const [row] = await db.insert(leads).values({
    category: d.category, source: "manual", name: d.name, whatsapp: d.whatsapp, email: d.email,
    city: d.city || null, state: d.state || null, message: d.message || null, assignedTo: user.id,
  }).returning({ id: leads.id });
  await db.insert(leadInteractions).values({ leadId: row.id, authorId: user.id, kind: "nota", body: "Lead cadastrado manualmente." });
  await audit(user.id, "lead.created", "business_leads", row.id, { source: "manual", category: d.category });
  revalidatePath("/admin/leads");
  redirect(`/admin/leads/${row.id}`);
}
