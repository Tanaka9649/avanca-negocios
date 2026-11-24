import "server-only";
import { sql } from "drizzle-orm";
import { requireDb } from "@/db";

/** Janela fixa persistida no Neon. Retorna true quando a requisição está dentro do limite. */
export async function allowRequest(key: string, limit: number, windowSeconds: number) {
  const db = requireDb();
  const result = await db.execute(sql`
    insert into rate_limits (key, count, window_start) values (${key}, 1, now())
    on conflict (key) do update set
      count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}) then 1 else rate_limits.count + 1 end,
      window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}) then now() else rate_limits.window_start end
    returning count
  `);
  const count = Number((result.rows[0] as { count: number } | undefined)?.count ?? 0);
  return count <= limit;
}
