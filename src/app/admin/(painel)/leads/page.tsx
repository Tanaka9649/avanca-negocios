import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { changeLeadStatus } from "@/lib/admin/lead-actions";
import { listLeads, listTeam, parseLeadFilters } from "@/lib/admin/lead-queries";
import { CATEGORY_LABELS, fmtDate, fmtPhone, LEAD_CATEGORIES, LEAD_STATUSES, STATUS_LABELS, waLink } from "@/lib/admin/labels";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Leads" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function LeadsPage({ searchParams }: { searchParams: SP }) {
  await requireUser("leads");
  const sp = await searchParams;
  const filters = parseLeadFilters(sp);
  const view = sp.view === "kanban" ? "kanban" : "lista";
  const [rows, team] = await Promise.all([listLeads(filters), listTeam()]);

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: filters.q, categoria: filters.categoria, status: filters.status, responsavel: filters.responsavel, view, ...extra };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `?${p.toString()}`;
  };
  const title = filters.categoria === "compra_empresa" ? "Compra de empresas" : filters.categoria === "venda_empresa" ? "Venda de empresas" : "Leads";
  const hasFilters = Boolean(filters.q || filters.categoria || filters.status || filters.responsavel);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>{title}</h1>
          <p>{rows.length === 1 ? "1 lead" : `${rows.length} leads`}{hasFilters ? " com os filtros aplicados" : ""}.</p>
        </div>
        <div className="adm-actions">
          <nav className="adm-seg" aria-label="Visualização">
            <Link href={qs({ view: "lista" })} aria-current={view === "lista" ? "page" : undefined}>Lista</Link>
            <Link href={qs({ view: "kanban" })} aria-current={view === "kanban" ? "page" : undefined}>Kanban</Link>
          </nav>
          <a className="adm-btn" href={`/admin/leads/exportar${qs({ view: undefined })}`}><Download size={16} />Exportar CSV</a>
          <Link className="adm-btn adm-btn--primary" href="/admin/leads/novo"><Plus size={16} />Novo lead</Link>
        </div>
      </div>

      <form className="adm-filters" role="search">
        <input type="hidden" name="view" value={view} />
        <input className="adm-input" type="search" name="q" defaultValue={filters.q} placeholder="Buscar por nome, e-mail, cidade ou telefone" aria-label="Buscar" />
        <select className="adm-input" name="categoria" defaultValue={filters.categoria ?? ""} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {LEAD_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
        {view === "lista" && (
          <select className="adm-input" name="status" defaultValue={filters.status ?? ""} aria-label="Status">
            <option value="">Todos os status</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        )}
        <select className="adm-input" name="responsavel" defaultValue={filters.responsavel ?? ""} aria-label="Responsável">
          <option value="">Qualquer responsável</option>
          <option value="sem">Sem responsável</option>
          {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button className="adm-btn">Filtrar</button>
        {hasFilters && <Link className="adm-btn" href={`/admin/leads?view=${view}`}>Limpar</Link>}
      </form>

      {rows.length === 0 ? (
        <div className="adm-card adm-empty">
          <strong>{hasFilters ? "Nenhum lead com esses filtros." : "Nenhum lead recebido ainda."}</strong>
          {hasFilters ? "Ajuste a busca ou limpe os filtros." : "Os formulários do site aparecem aqui assim que alguém enviar. Você também pode cadastrar um lead manualmente."}
        </div>
      ) : view === "lista" ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Nome</th><th>Categoria</th><th>Status</th><th>WhatsApp</th><th>Cidade</th><th>Responsável</th><th>Próxima ação</th><th>Recebido</th></tr></thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td><Link className="adm-rowlink" href={`/admin/leads/${l.id}`}>{l.name}</Link></td>
                  <td>{CATEGORY_LABELS[l.category]}</td>
                  <td><span className={`adm-badge adm-badge--${l.status}`}>{STATUS_LABELS[l.status]}</span></td>
                  <td><a href={waLink(l.whatsapp)} target="_blank" rel="noopener noreferrer">{fmtPhone(l.whatsapp)}</a></td>
                  <td>{[l.city, l.state].filter(Boolean).join("/") || "—"}</td>
                  <td>{l.assignedName ?? "—"}</td>
                  <td>{l.nextAction ? `${l.nextAction}${l.nextActionAt ? ` · ${fmtDate(l.nextActionAt)}` : ""}` : "—"}</td>
                  <td>{fmtDate(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-kanban">
          {LEAD_STATUSES.map((s) => {
            const col = rows.filter((l) => l.status === s);
            return (
              <section key={s} className="adm-col" aria-label={STATUS_LABELS[s]}>
                <div className="adm-col__head"><span>{STATUS_LABELS[s]}</span><span className="adm-badge">{col.length}</span></div>
                {col.map((l) => (
                  <article key={l.id} className="adm-kcard">
                    <Link href={`/admin/leads/${l.id}`}>{l.name}</Link>
                    <span className="adm-muted">{CATEGORY_LABELS[l.category]}{l.city ? ` · ${l.city}` : ""}</span>
                    {l.nextAction && <span>Próxima ação: {l.nextAction}{l.nextActionAt ? ` (${fmtDate(l.nextActionAt)})` : ""}</span>}
                    <form action={changeLeadStatus} key={l.status}>
                      <input type="hidden" name="leadId" value={l.id} />
                      <select name="status" defaultValue={l.status} aria-label={`Status de ${l.name}`}>
                        {LEAD_STATUSES.map((o) => <option key={o} value={o}>{STATUS_LABELS[o]}</option>)}
                      </select>
                      <button className="adm-btn adm-btn--sm">Mover</button>
                    </form>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
