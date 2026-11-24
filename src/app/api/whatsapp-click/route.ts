import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { eventInterests, whatsappClicks } from "@/db/schema";
import { allowRequest } from "@/lib/rate-limit";
import { clientIpHash } from "@/lib/security";

const schema = z.object({
  context: z.enum(["eventos", "venda", "compra", "institucional"]),
  path: z.string().max(300).optional(),
  eventId: z.string().uuid().optional(),
  utmSource: z.string().max(120).optional(),
  utmCampaign: z.string().max(160).optional(),
});

// Registra apenas o clique (sem dados pessoais) para os indicadores do painel.
export async function POST(request: Request) {
  if (!db) return new NextResponse(null, { status: 204 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  const ipHash = await clientIpHash();
  if (!(await allowRequest(`wa:${ipHash}`, 30, 3600))) return new NextResponse(null, { status: 204 });
  const { context, path, eventId, utmSource, utmCampaign } = parsed.data;
  try {
    await db.insert(whatsappClicks).values({ context, path, eventId, utmSource, utmCampaign });
    if (eventId) await db.insert(eventInterests).values({ eventId });
  } catch {
    // Evento inexistente ou falha transitória: o clique segue para o WhatsApp de qualquer forma.
  }
  return new NextResponse(null, { status: 204 });
}
