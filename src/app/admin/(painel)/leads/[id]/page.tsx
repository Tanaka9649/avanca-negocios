import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { requireDb } from "@/db";
import { businessUsers, events, leadInteractions, leads } from "@/db/schema";
import { addLeadNote, changeLeadStatus, updateLeadFollowUp } from "@/lib/admin/lead-actions";
import { listTeam } from "@/lib/admin/lead-queries";
import { CATEGORY_LABELS, DETAIL_LABELS, fmtDateTime, fmtPhone, LEAD_STATUSES, SOURCE_LABELS, STATUS_LABELS, toLocalInput, waLink } from "@/lib/admin/labels";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Lead" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("leads");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = requireDb();
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) notFound();
  const [history, team, event] = await Promise.all([
    db.select({ id: leadInteractions.id, kind: leadInteractions.kind, body: leadInteractions.body, fromStatus: leadInteractions.fromStatus, toStatus: leadInteractions.toStatus, createdAt: leadInteractions.createdAt, author: businessUsers.name })
      .from(leadInteractions).leftJoin(businessUsers, eq(businessUsers.id, leadInteractions.authorId))
      .where(eq(leadInteractions.leadId, id)).orderBy(asc(leadInteractions.createdAt)),
    listTeam(),
    lead.eventId ? db.select({ name: events.name }).from(events).where(eq(events.id, lead.eventId)).then((r) => r[0]) : Promise.resolve(undefined),
  ]);
  const details = Object.entries(lead.details ?? {});
  const origin = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ");

  return (
    <>
      <Link className="adm-back" href="/admin/leads"><ArrowLeft size={16} />Leads</Link>
      <div className="adm-head">
        <div>
          <h1>{lead.name}</h1>
          <p>{CATEGORY_LABELS[lead.category]} · recebido em {fmtDateTime(lead.createdAt)} · {SOURCE_LABELS[lead.source]}</p>
        </div>
        <div className="adm-actions">
          <span className={`adm-badge adm-badge--${lead.status}`}>{STATUS_LABELS[lead.status]}</span>
          <a className="adm-btn adm-btn--wa" href={waLink(lead.whatsapp)} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
        </div>
      </div>

      <div className="adm-grid adm-grid--side">
        <div>
          <section className="adm-card">
            <h2>Dados do contato</h2>
            <dl className="adm-dl">
              <dt>WhatsApp</dt><dd>{fmtPhone(lead.whatsapp)}</dd>
              <dt>E-mail</dt><dd>{lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}</dd>
              <dt>Cidade</dt><dd>{[lead.city, lead.state].filter(Boolean).join("/") || "—"}</dd>
              {details.map(([k, v]) => <Fragment key={k}><dt>{DETAIL_LABELS[k] ?? k}</dt><dd>{v}</dd></Fragment>)}
              {event && <><dt>Evento</dt><dd>{event.name}</dd></>}
              {lead.message && <><dt>Mensagem</dt><dd style={{ whiteSpace: "pre-wrap" }}>{lead.message}</dd></>}
              <dt>Origem</dt><dd>{origin || (lead.referrer ? lead.referrer : "Acesso direto")}</dd>
              {lead.landingPath && <><dt>Página</dt><dd>{lead.landingPath}</dd></>}
              <dt>Consentimento</dt><dd>{lead.consentAt ? `${fmtDateTime(lead.consentAt)} (política ${lead.consentVersion})` : "Não se aplica (cadastro interno)"}</dd>
            </dl>
          </section>

          <section className="adm-card">
            <h2>Histórico de atendimento</h2>
            <form action={addLeadNote} className="adm-form" style={{ marginBottom: 20 }}>
              <input type="hidden" name="leadId" value={lead.id} />
              <label className="adm-field"><span>Registrar</span>
                <textarea name="body" placeholder="Ex.: Liguei, ficou de enviar as informações na sexta." required maxLength={4000} />
              </label>
              <div className="adm-actions">
                <select name="kind" className="adm-input" style={{ width: "auto" }} aria-label="Tipo de registro"><option value="nota">Anotação interna</option><option value="contato">Contato realizado</option></select>
                <button className="adm-btn adm-btn--primary">Salvar registro</button>
              </div>
            </form>
            {history.length === 0 ? <p className="adm-muted">Nenhum registro ainda.</p> : (
              <ol className="adm-timeline">
                {[...history].reverse().map((h) => (
                  <li key={h.id}>
                    <div>
                      <time>{fmtDateTime(h.createdAt)}{h.author ? ` · ${h.author}` : ""}</time>
                      {h.kind === "status" ? <>Status alterado de <b>{h.fromStatus ? STATUS_LABELS[h.fromStatus] : "—"}</b> para <b>{h.toStatus ? STATUS_LABELS[h.toStatus] : "—"}</b></>
                        : <span style={{ whiteSpace: "pre-wrap" }}>{h.kind === "contato" ? "Contato: " : ""}{h.body}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div>
          <section className="adm-card">
            <h2>Status</h2>
            <form action={changeLeadStatus} className="adm-actions" key={lead.status}>
              <input type="hidden" name="leadId" value={lead.id} />
              <select name="status" className="adm-input" defaultValue={lead.status} aria-label="Status" style={{ flex: 1 }}>
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <button className="adm-btn adm-btn--primary">Alterar</button>
            </form>
          </section>
          <section className="adm-card">
            <h2>Acompanhamento</h2>
            <form action={updateLeadFollowUp} className="adm-form" key={`${lead.assignedTo}-${lead.nextAction}-${lead.nextActionAt?.getTime()}`}>
              <input type="hidden" name="leadId" value={lead.id} />
              <label className="adm-field"><span>Responsável</span>
                <select name="assignedTo" defaultValue={lead.assignedTo ?? ""}>
                  <option value="">Sem responsável</option>
                  {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </label>
              <label className="adm-field"><span>Próxima ação</span><input name="nextAction" defaultValue={lead.nextAction ?? ""} placeholder="Ex.: Agendar reunião" maxLength={300} /></label>
              <label className="adm-field"><span>Quando</span><input name="nextActionAt" type="datetime-local" defaultValue={toLocalInput(lead.nextActionAt)} /></label>
              <button className="adm-btn adm-btn--primary">Salvar acompanhamento</button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
