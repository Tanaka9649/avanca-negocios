import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzleNeon<typeof schema>>;

function create(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // Banco local (testes de ponta a ponta sem rede): protocolo Postgres padrão em localhost.
  if (/^postgres(ql)?:\/\/[^@]*@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
    const g = globalThis as unknown as { __pgPool?: Pool };
    g.__pgPool ??= new Pool({ connectionString: url, max: 1 });
    return drizzlePg(g.__pgPool, { schema }) as unknown as Db;
  }
  return drizzleNeon(neon(url), { schema });
}

export const db = create();

export function requireDb() {
  if (!db) throw new Error("DATABASE_URL não configurada");
  return db;
}
