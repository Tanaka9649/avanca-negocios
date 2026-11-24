import { NextResponse } from "next/server";
import { audit } from "@/lib/admin/audit";
import { listLeads, parseLeadFilters } from "@/lib/admin/lead-queries";
import { CATEGORY_LABELS, DETAIL_LABELS, fmtDateTime, SOURCE_LABELS, STATUS_LABELS } from "@/lib/admin/labels";
import { can, getCurrentUser } from "@/lib/auth";

function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // evita execução de fórmulas no Excel
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user, "leads")) return new NextResponse("Não autorizado", { status: 401 });
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const rows = await listLeads(parseLeadFilters(sp), 10000);
  const detailKeys = Object.keys(DETAIL_LABELS);
  const header = ["Recebido em", "Nome", "WhatsApp", "E-mail", "Cidade", "UF", "Categoria", "Status", "Origem", "Responsável", "Próxima ação", "Data da próxima ação", ...detailKeys.map((k) => DETAIL_LABELS[k]), "Mensagem", "utm_source", "utm_medium", "utm_campaign"];
  const lines = rows.map((l) => [
    fmtDateTime(l.createdAt), l.name, l.whatsapp, l.email, l.city, l.state, CATEGORY_LABELS[l.category], STATUS_LABELS[l.status], SOURCE_LABELS[l.source],
    l.assignedName, l.nextAction, l.nextActionAt ? fmtDateTime(l.nextActionAt) : "", ...detailKeys.map((k) => (l.details as Record<string, string>)[k]), l.message,
    l.utmSource, l.utmMedium, l.utmCampaign,
  ].map(cell).join(";"));
  await audit(user.id, "lead.export", "business_leads", undefined, { count: rows.length, filters: sp });
  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="Avanca Negocios - Leads ${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
