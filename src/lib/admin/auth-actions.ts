"use server";

import { timingSafeEqual } from "node:crypto";
import { count, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb } from "@/db";
import { businessUsers } from "@/db/schema";
import { audit } from "@/lib/admin/audit";
import { createSession, destroySession, DUMMY_HASH, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { clientIpHash } from "@/lib/security";

export type FormState = { error?: string; ok?: string } | undefined;

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Informe e-mail e senha." };

  const ipHash = await clientIpHash();
  const okIp = await allowRequest(`login-ip:${ipHash}`, 10, 900);
  const okEmail = await allowRequest(`login-email:${email}`, 8, 900);
  if (!okIp || !okEmail) return { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." };

  const db = requireDb();
  const [user] = await db.select().from(businessUsers).where(sql`lower(${businessUsers.email}) = ${email}`).limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || user.status !== "ativo") return { error: "E-mail ou senha incorretos." };

  await createSession(user.id, ipHash);
  await db.update(businessUsers).set({ lastLoginAt: new Date() }).where(eq(businessUsers.id, user.id));
  await audit(user.id, "auth.login", "business_users", user.id);
  redirect("/admin");
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await audit(user.id, "auth.logout", "business_users", user.id);
  redirect("/admin/login");
}

const passwordSchema = z.string().min(10, "A senha precisa ter pelo menos 10 caracteres.").max(128);

function sameToken(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const setupSchema = z.object({
  token: z.string().min(1, "Informe o código de primeiro acesso."),
  name: z.string().trim().min(3, "Informe seu nome."),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  password: passwordSchema,
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "As senhas não conferem.", path: ["confirm"] });

/** Cria o primeiro administrador. Só funciona enquanto não houver nenhum usuário e com o código definido em ADMIN_SETUP_TOKEN. */
export async function setupAction(_: FormState, formData: FormData): Promise<FormState> {
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected) return { error: "Primeiro acesso desativado neste ambiente." };
  const ipHash = await clientIpHash();
  if (!(await allowRequest(`setup:${ipHash}`, 5, 900))) return { error: "Muitas tentativas. Aguarde 15 minutos." };

  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!sameToken(parsed.data.token.trim(), expected)) return { error: "Código de primeiro acesso inválido." };

  const db = requireDb();
  const [{ total }] = await db.select({ total: count() }).from(businessUsers);
  if (total > 0) return { error: "O primeiro acesso já foi concluído. Entre com seu e-mail e senha." };

  const [user] = await db.insert(businessUsers).values({
    name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password), role: "admin",
  }).returning({ id: businessUsers.id });
  await audit(user.id, "user.bootstrap_admin", "business_users", user.id);
  await createSession(user.id, ipHash);
  redirect("/admin");
}
