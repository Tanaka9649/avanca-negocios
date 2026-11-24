import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function clientIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const pepper = process.env.IP_HASH_PEPPER ?? "dev-only-pepper";
  return createHash("sha256").update(`${pepper}:${ip}`).digest("hex");
}
