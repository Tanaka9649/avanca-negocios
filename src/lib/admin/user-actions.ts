"use server";

import { and, count, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireDb } from "@/db";
import { businessSessions, businessUsers } from "@/db/schema";
import { audit } from "@/lib/admin/audit";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";

export type UserState = { error?: string; ok?: string } | undefined;

const roleEnum = z.enum(["admin", "gestor", "atendimento", "editor"]);
const password = z.string().min(10, "A senha precisa ter pelo menos 10 caracteres.").max(128);

async function otherActiveAdmins(exceptId: string) {
  const [{ n }] = await requireDb().select({ n: count() }).from(businessUsers)
    .where(and(eq(businessUsers.role, "admin"), eq(businessUsers.status, "ativo"), ne(businessUsers.id, exceptId)));
  return n;
}

export async function createUser(_: UserState, formData: FormData): Promise<UserState> {
  const admin = await requireUser("usuarios");
  const parsed = z.object({
    name: z.string().trim().min(3, "Informe o nome.").max(120),
    email: z.string().trim().toLowerCase().email("E-mail inválido."),
    role: roleEnum,
    password,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const db = requireDb();
  const [exists] = await db.select({ id: businessUsers.id }).from(businessUsers).where(sql`lower(${businessUsers.email}) = ${parsed.data.email}`).limit(1);
  if (exists) return { error: "Já existe um usuário com esse e-mail." };
  const [row] = await db.insert(businessUsers).values({
    name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash: await hashPassword(parsed.data.password),
  }).returning({ id: businessUsers.id });
  await audit(admin.id, "user.created", "business_users", row.id, { email: parsed.data.email, role: parsed.data.role });
  revalidatePath("/admin/usuarios");
  return { ok: `Usuário criado. Repasse a senha inicial a ${parsed.data.name} por um canal seguro e peça para trocá-la em “Minha conta”.` };
}

export async function updateUser(formData: FormData) {
  const admin = await requireUser("usuarios");
  const id = z.string().uuid().parse(formData.get("id"));
  const role = roleEnum.parse(formData.get("role"));
  const status = z.enum(["ativo", "suspenso"]).parse(formData.get("status"));
  const db = requireDb();
  const [target] = await db.select().from(businessUsers).where(eq(businessUsers.id, id)).limit(1);
  if (!target) return;
  if (id === admin.id && (role !== "admin" || status !== "ativo")) return; // ninguém rebaixa ou suspende a si mesmo
  if (target.role === "admin" && (role !== "admin" || status !== "ativo") && (await otherActiveAdmins(id)) === 0) return;
  await db.update(businessUsers).set({ role, status, updatedAt: new Date() }).where(eq(businessUsers.id, id));
  if (status === "suspenso") await db.delete(businessSessions).where(eq(businessSessions.userId, id));
  await audit(admin.id, "user.updated", "business_users", id, { from: { role: target.role, status: target.status }, to: { role, status } });
  revalidatePath("/admin/usuarios");
}

export async function resetUserPassword(_: UserState, formData: FormData): Promise<UserState> {
  const admin = await requireUser("usuarios");
  const id = z.string().uuid().safeParse(formData.get("id"));
  const pw = password.safeParse(formData.get("password"));
  if (!id.success) return { error: "Usuário inválido." };
  if (!pw.success) return { error: pw.error.issues[0].message };
  const db = requireDb();
  await db.update(businessUsers).set({ passwordHash: await hashPassword(pw.data), updatedAt: new Date() }).where(eq(businessUsers.id, id.data));
  await db.delete(businessSessions).where(eq(businessSessions.userId, id.data));
  await audit(admin.id, "user.password_reset", "business_users", id.data);
  return { ok: "Senha redefinida. As sessões abertas desse usuário foram encerradas." };
}

export async function changeOwnPassword(_: UserState, formData: FormData): Promise<UserState> {
  const user = await requireUser();
  const parsed = z.object({ current: z.string().min(1, "Informe a senha atual."), next: password, confirm: z.string() })
    .refine((d) => d.next === d.confirm, { message: "As senhas não conferem." }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const db = requireDb();
  const [row] = await db.select({ hash: businessUsers.passwordHash }).from(businessUsers).where(eq(businessUsers.id, user.id)).limit(1);
  if (!row || !(await verifyPassword(parsed.data.current, row.hash))) return { error: "Senha atual incorreta." };
  await db.update(businessUsers).set({ passwordHash: await hashPassword(parsed.data.next), updatedAt: new Date() }).where(eq(businessUsers.id, user.id));
  await audit(user.id, "user.password_changed", "business_users", user.id);
  return { ok: "Senha alterada." };
}
