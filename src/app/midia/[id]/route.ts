import { eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!db || !/^[0-9a-f-]{36}$/.test(id)) return new Response("Não encontrado", { status: 404 });
  const [row] = await db.select({ bytes: mediaAssets.bytes, contentType: mediaAssets.contentType }).from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  if (!row) return new Response("Não encontrado", { status: 404 });
  return new Response(new Uint8Array(row.bytes), {
    headers: {
      "Content-Type": row.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
