// Servidor Postgres local sobre PGlite, com as migrations aplicadas. Uso: node scripts/pglite-server.mjs <dir> <porta>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
const [dir, port = "54329"] = process.argv.slice(2);
const fresh = !existsSync(dir);
const db = await PGlite.create(dir);
if (fresh) for (const f of readdirSync("drizzle").filter((f) => f.endsWith(".sql")).sort())
  for (const stmt of readFileSync(`drizzle/${f}`, "utf8").split("--> statement-breakpoint")) if (stmt.trim()) await db.exec(stmt);
const server = new PGLiteSocketServer({ db, port: Number(port), host: "127.0.0.1" });
await server.start();
console.log(`pglite em 127.0.0.1:${port}`);
