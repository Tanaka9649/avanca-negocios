import { count, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { requireDb } from "@/db";
import { eventInterests, events, leads } from "@/db/schema";
import { deleteEvent, toggleEventPublished } from "@/lib/admin/event-actions";
import { fmtDateTime, toLocalInput } from "@/lib/admin/labels";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Editar evento" };

export default async function EditEventPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser("eventos");
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = requireDb();
  const [ev] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!ev) notFound();
  const [[clicks], linkedLeads] = await Promise.all([
    db.select({ n: count() }).from(eventInterests).where(eq(eventInterests.eventId, id)),
    db.select({ id: leads.id, name: leads.name, createdAt: leads.createdAt }).from(leads).where(eq(leads.eventId, id)),
  ]);
  const published = Boolean(ev.publishedAt);
  const isFuture = ev.startsAt > new Date();

  return (
    <>
      <Link className="adm-back" href="/admin/eventos"><ArrowLeft size={16} />Eventos</Link>
      {sp.salvo && <p className="adm-ok" style={{ marginBottom: 16 }}>Evento cadastrado como rascunho.</p>}
      {sp.erro === "confirmacao" && <p className="adm-alert" style={{ marginBottom: 16 }}>Marque a confirmação para excluir o evento.</p>}
      <div className="adm-head">
        <div><h1>{ev.name}</h1><p>{fmtDateTime(ev.startsAt)} · {published ? (isFuture ? "Publicado e visível no site" : "Publicado, mas já realizado (não aparece no site)") : "Rascunho, não aparece no site"}</p></div>
        <form action={toggleEventPublished}>
          <input type="hidden" name="id" value={ev.id} />
          <input type="hidden" name="publish" value={published ? "0" : "1"} />
          <button className={`adm-btn ${published ? "" : "adm-btn--primary"}`}>{published ? "Despublicar" : "Publicar no site"}</button>
        </form>
      </div>
      <div className="adm-grid adm-grid--side">
        <div className="adm-card">
          <EventForm values={{
            id: ev.id, name: ev.name, description: ev.description ?? "", startsAt: toLocalInput(ev.startsAt), endsAt: toLocalInput(ev.endsAt),
            locationName: ev.locationName ?? "", address: ev.address ?? "", city: ev.city, status: ev.status, imageUrl: ev.imageUrl, imageAlt: ev.imageAlt ?? "",
          }} />
        </div>
        <div>
          <section className="adm-card">
            <h2>Interessados</h2>
            <p style={{ margin: 0 }}><strong style={{ fontSize: 28 }}>{clicks.n}</strong> {clicks.n === 1 ? "clique" : "cliques"} em “Tenho interesse”.</p>
            <p className="adm-muted" style={{ fontSize: 13.5 }}>O atendimento segue pelo WhatsApp. Cadastre como lead quem confirmar interesse, para acompanhar no CRM.</p>
            {linkedLeads.length > 0 && <ul style={{ paddingLeft: 18 }}>{linkedLeads.map((l) => <li key={l.id}><Link href={`/admin/leads/${l.id}`}>{l.name}</Link></li>)}</ul>}
          </section>
          <section className="adm-card">
            <h2>Excluir evento</h2>
            <form action={deleteEvent} className="adm-form">
              <input type="hidden" name="id" value={ev.id} />
              <label className="adm-check"><input type="checkbox" name="confirm" required />Confirmo a exclusão definitiva deste evento e da imagem.</label>
              <div><button className="adm-btn adm-btn--danger">Excluir evento</button></div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
