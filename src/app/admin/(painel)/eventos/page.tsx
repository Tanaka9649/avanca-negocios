import { asc, count, desc, eq, gte, lt } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireDb } from "@/db";
import { eventInterests, events } from "@/db/schema";
import { EVENT_STATUS_LABELS, fmtDateTime } from "@/lib/admin/labels";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Eventos" };

export default async function EventsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser("eventos");
  const sp = await searchParams;
  const tab = sp.aba === "anteriores" ? "anteriores" : "proximos";
  const now = new Date();
  const db = requireDb();
  const rows = await db.select({
    id: events.id, name: events.name, startsAt: events.startsAt, status: events.status, publishedAt: events.publishedAt, city: events.city, locationName: events.locationName,
    interests: count(eventInterests.id),
  }).from(events).leftJoin(eventInterests, eq(eventInterests.eventId, events.id))
    .where(tab === "proximos" ? gte(events.startsAt, now) : lt(events.startsAt, now))
    .groupBy(events.id).orderBy(tab === "proximos" ? asc(events.startsAt) : desc(events.startsAt));

  return (
    <>
      {sp.excluido && <p className="adm-ok" style={{ marginBottom: 16 }}>Evento excluído.</p>}
      <div className="adm-head">
        <div><h1>Eventos</h1><p>Só eventos publicados e futuros aparecem no site, na seção “Próximos encontros”.</p></div>
        <div className="adm-actions">
          <nav className="adm-seg" aria-label="Período">
            <Link href="/admin/eventos" aria-current={tab === "proximos" ? "page" : undefined}>Próximos</Link>
            <Link href="/admin/eventos?aba=anteriores" aria-current={tab === "anteriores" ? "page" : undefined}>Anteriores</Link>
          </nav>
          <Link className="adm-btn adm-btn--primary" href="/admin/eventos/novo"><Plus size={16} />Novo evento</Link>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="adm-card adm-empty">
          <strong>{tab === "proximos" ? "Nenhum evento futuro cadastrado." : "Nenhum evento anterior."}</strong>
          {tab === "proximos" && "Enquanto não houver evento publicado, a seção de próximos encontros fica oculta no site."}
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Evento</th><th>Data</th><th>Local</th><th>Status</th><th>No site</th><th>Interessados</th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td><Link className="adm-rowlink" href={`/admin/eventos/${e.id}`}>{e.name}</Link></td>
                  <td>{fmtDateTime(e.startsAt)}</td>
                  <td>{[e.locationName, e.city].filter(Boolean).join(", ")}</td>
                  <td>{EVENT_STATUS_LABELS[e.status]}</td>
                  <td>{e.publishedAt ? <span className="adm-badge adm-badge--on">Publicado</span> : <span className="adm-badge adm-badge--off">Rascunho</span>}</td>
                  <td>{e.interests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
