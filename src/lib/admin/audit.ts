import "server-only";
import { requireDb } from "@/db";
import { auditLogs } from "@/db/schema";

export async function audit(actorId: string | null, action: string, entity: string, entityId?: string, changes?: unknown) {
  await requireDb().insert(auditLogs).values({ actorId, action, entity, entityId, changes: changes ?? null });
}
