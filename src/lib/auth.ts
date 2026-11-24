import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { requireDb } from "@/db";
import { businessSessions, businessUsers } from "@/db/schema";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;

export const SESSION_COOKIE = "an_session";
const SESSION_DAYS = 7;
const N = 2 ** 15, R = 8, P = 1, KEYLEN = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, n, r, p, saltB64, hashB64] = stored.split("$");
  if (alg !== "scrypt") return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Hash usado quando o e-mail não existe, para o tempo de resposta não revelar contas.
export const DUMMY_HASH = "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + Buffer.alloc(64).toString("base64");

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, ipHash?: string) {
  const db = requireDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.insert(businessSessions).values({ userId, tokenHash: tokenHash(token), expiresAt, ipHash });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await requireDb().delete(businessSessions).where(eq(businessSessions.tokenHash, tokenHash(token)));
  jar.delete(SESSION_COOKIE);
}

export type Role = "admin" | "gestor" | "atendimento" | "editor";
export type SessionUser = { id: string; name: string; email: string; role: Role };

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await requireDb()
    .select({ id: businessUsers.id, name: businessUsers.name, email: businessUsers.email, role: businessUsers.role, status: businessUsers.status })
    .from(businessSessions)
    .innerJoin(businessUsers, eq(businessUsers.id, businessSessions.userId))
    .where(and(eq(businessSessions.tokenHash, tokenHash(token)), gt(businessSessions.expiresAt, new Date())))
    .limit(1);
  if (!row || row.status !== "ativo") return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role };
});

export type Permission = "dashboard" | "leads" | "eventos" | "empresas" | "conteudo" | "usuarios" | "configuracoes";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ["dashboard", "leads", "eventos", "empresas", "conteudo", "usuarios", "configuracoes"],
  gestor: ["dashboard", "leads", "eventos", "empresas", "conteudo", "configuracoes"],
  atendimento: ["dashboard", "leads"],
  editor: ["dashboard", "eventos", "empresas", "conteudo"],
};

export const ROLE_LABELS: Record<Role, string> = { admin: "Administrador", gestor: "Gestor", atendimento: "Atendimento", editor: "Editor de conteúdo" };

export function can(user: SessionUser, permission: Permission) {
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

/** Exige sessão válida e, se informada, a permissão. Use em toda página e ação do painel. */
export async function requireUser(permission?: Permission) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user, permission)) redirect("/admin?sem-permissao=1");
  return user;
}
