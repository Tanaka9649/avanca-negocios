import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, leads } from "@/db/schema";
import { leadSchema } from "@/lib/lead-input";
import { allowRequest } from "@/lib/rate-limit";
import { clientIpHash } from "@/lib/security";
import { CONSENT_VERSION } from "@/lib/site";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Cadastro indisponível no momento. Fale conosco pelo WhatsApp." }, { status: 503 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Envio inválido." }, { status: 400 }); }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: "Revise os campos destacados.", fieldErrors }, { status: 422 });
  }
  const input = parsed.data;

  // Robôs: honeypot preenchido ou envio em menos de 3 segundos. Responde como sucesso sem gravar.
  if (input.website || (input.startedAt && Date.now() - input.startedAt < 3000)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const ipHash = await clientIpHash();
  if (!(await allowRequest(`lead:${ipHash}`, 5, 3600))) {
    return NextResponse.json({ error: "Recebemos vários envios deste acesso. Tente novamente em uma hora ou fale pelo WhatsApp." }, { status: 429 });
  }

  const details: Record<string, string> = input.kind === "venda_empresa"
    ? { segmento: input.segment, tempoDeOperacao: input.operatingTime, ...(input.revenueRange && { faixaDeFaturamento: input.revenueRange }), ...(input.priceExpectation && { expectativaDeValor: input.priceExpectation }) }
    : { segmentoDeInteresse: input.segment, regiaoDeInteresse: input.region, objetivo: input.goal, ...(input.investmentRange && { faixaDeInvestimento: input.investmentRange }) };

  const t = input.tracking ?? {};
  const [row] = await db.insert(leads).values({
    category: input.kind,
    name: input.name,
    whatsapp: input.whatsapp,
    email: input.email,
    city: input.city,
    state: input.state,
    message: input.message,
    details,
    utmSource: t.utmSource, utmMedium: t.utmMedium, utmCampaign: t.utmCampaign, utmTerm: t.utmTerm, utmContent: t.utmContent,
    referrer: t.referrer, landingPath: t.landingPath,
    consentAt: new Date(), consentVersion: CONSENT_VERSION,
    ipHash,
  }).returning({ id: leads.id });

  await db.insert(auditLogs).values({ action: "lead.created", entity: "business_leads", entityId: row.id, changes: { category: input.kind, source: "formulario" } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
