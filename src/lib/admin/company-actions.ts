"use server";

import { asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb } from "@/db";
import { participatingCompanies } from "@/db/schema";
import { audit } from "@/lib/admin/audit";
import { deleteImageByUrl, fileFrom, MediaError, saveImage } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth";

export type CompanyFormState = { error?: string; ok?: string } | undefined;

const optionalUrl = z.string().trim().max(200).optional().transform((v) => v || undefined)
  .refine((v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v), "Website inválido.");

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome da empresa.").max(120),
  segment: z.string().trim().max(80).optional(),
  instagram: z.string().trim().max(80).optional().transform((v) => v?.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/^@/, "").replace(/\/$/, "") || undefined),
  website: optionalUrl,
  active: z.string().optional(),
});

function revalidateCompanies() {
  revalidatePath("/eventos");
  revalidatePath("/admin/empresas");
  revalidatePath("/admin");
}

export async function saveCompany(_: CompanyFormState, formData: FormData): Promise<CompanyFormState> {
  const user = await requireUser("empresas");
  const id = String(formData.get("id") ?? "") || null;
  if (id && !/^[0-9a-f-]{36}$/.test(id)) return { error: "Empresa inválida." };
  const parsed = schema.safeParse(Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const db = requireDb();
  const [current] = id ? await db.select().from(participatingCompanies).where(eq(participatingCompanies.id, id)).limit(1) : [undefined];
  if (id && !current) return { error: "Empresa não encontrada." };

  let logoUrl = current?.logoUrl ?? null;
  const file = fileFrom(formData, "logo");
  try {
    if (file) logoUrl = await saveImage(file, "empresa", user.id);
  } catch (e) {
    return { error: e instanceof MediaError ? e.message : "Falha ao salvar a logo." };
  }
  if (formData.get("removeLogo") === "on" && !file) logoUrl = null;

  const values = { name: d.name, segment: d.segment || null, instagram: d.instagram ?? null, website: d.website ?? null, logoUrl, active: d.active === "on", updatedAt: new Date() };
  if (current) {
    await db.update(participatingCompanies).set(values).where(eq(participatingCompanies.id, current.id));
    if (current.logoUrl && current.logoUrl !== logoUrl) await deleteImageByUrl(current.logoUrl);
    await audit(user.id, "company.updated", "participating_companies", current.id, { name: d.name, active: values.active });
    revalidateCompanies();
    return { ok: "Alterações salvas." };
  }
  const [{ top }] = await db.select({ top: max(participatingCompanies.sortOrder) }).from(participatingCompanies);
  const [row] = await db.insert(participatingCompanies).values({ ...values, sortOrder: (top ?? 0) + 10 }).returning({ id: participatingCompanies.id });
  await audit(user.id, "company.created", "participating_companies", row.id, { name: d.name });
  revalidateCompanies();
  redirect("/admin/empresas?salvo=1");
}

export async function moveCompany(formData: FormData) {
  const user = await requireUser("empresas");
  const id = z.string().uuid().parse(formData.get("id"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const db = requireDb();
  const all = await db.select({ id: participatingCompanies.id }).from(participatingCompanies).orderBy(asc(participatingCompanies.sortOrder), asc(participatingCompanies.name));
  const i = all.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  // Renumera tudo em passos de 10 para manter a ordem estável.
  await Promise.all(all.map((c, k) => db.update(participatingCompanies).set({ sortOrder: (k + 1) * 10 }).where(eq(participatingCompanies.id, c.id))));
  await audit(user.id, "company.reordered", "participating_companies", id, { dir });
  revalidateCompanies();
}

export async function toggleCompany(formData: FormData) {
  const user = await requireUser("empresas");
  const id = z.string().uuid().parse(formData.get("id"));
  const active = formData.get("active") === "1";
  await requireDb().update(participatingCompanies).set({ active, updatedAt: new Date() }).where(eq(participatingCompanies.id, id));
  await audit(user.id, active ? "company.activated" : "company.deactivated", "participating_companies", id);
  revalidateCompanies();
}

export async function deleteCompany(formData: FormData) {
  const user = await requireUser("empresas");
  const id = z.string().uuid().parse(formData.get("id"));
  if (formData.get("confirm") !== "on") redirect(`/admin/empresas/${id}?erro=confirmacao`);
  const db = requireDb();
  const [c] = await db.select().from(participatingCompanies).where(eq(participatingCompanies.id, id)).limit(1);
  if (c) {
    await db.delete(participatingCompanies).where(eq(participatingCompanies.id, id));
    await deleteImageByUrl(c.logoUrl);
    await audit(user.id, "company.deleted", "participating_companies", id, { name: c.name });
  }
  revalidateCompanies();
  redirect("/admin/empresas?excluida=1");
}
