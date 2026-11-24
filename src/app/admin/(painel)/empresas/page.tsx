import { asc } from "drizzle-orm";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import Link from "next/link";
import { requireDb } from "@/db";
import { participatingCompanies } from "@/db/schema";
import { moveCompany, toggleCompany } from "@/lib/admin/company-actions";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Empresas participantes" };

export default async function CompaniesAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser("empresas");
  const sp = await searchParams;
  const rows = await requireDb().select().from(participatingCompanies).orderBy(asc(participatingCompanies.sortOrder), asc(participatingCompanies.name));
  return (
    <>
      {sp.salvo && <p className="adm-ok" style={{ marginBottom: 16 }}>Empresa cadastrada.</p>}
      {sp.excluida && <p className="adm-ok" style={{ marginBottom: 16 }}>Empresa excluída.</p>}
      <div className="adm-head">
        <div><h1>Empresas participantes</h1><p>As empresas ativas aparecem na página de eventos, nesta ordem. Sem nenhuma ativa, a seção fica oculta.</p></div>
        <Link className="adm-btn adm-btn--primary" href="/admin/empresas/nova"><Plus size={16} />Nova empresa</Link>
      </div>
      {rows.length === 0 ? (
        <div className="adm-card adm-empty"><strong>Nenhuma empresa cadastrada.</strong>Cadastre as empresas que participam da Avança Negócios, com a logo oficial de cada uma.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Ordem</th><th>Logo</th><th>Empresa</th><th>Segmento</th><th>No site</th><th /></tr></thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <div className="adm-actions">
                      <form action={moveCompany}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="up" /><button className="adm-btn adm-btn--sm" disabled={i === 0} aria-label={`Subir ${c.name}`}><ArrowUp size={14} /></button></form>
                      <form action={moveCompany}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="down" /><button className="adm-btn adm-btn--sm" disabled={i === rows.length - 1} aria-label={`Descer ${c.name}`}><ArrowDown size={14} /></button></form>
                    </div>
                  </td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <td>{c.logoUrl ? <img className="adm-thumb adm-thumb--logo" src={c.logoUrl} alt="" /> : <span className="adm-muted">Sem logo</span>}</td>
                  <td><Link className="adm-rowlink" href={`/admin/empresas/${c.id}`}>{c.name}</Link></td>
                  <td>{c.segment ?? "—"}</td>
                  <td>{c.active ? <span className="adm-badge adm-badge--on">Ativa</span> : <span className="adm-badge adm-badge--off">Inativa</span>}</td>
                  <td>
                    <form action={toggleCompany}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={c.active ? "0" : "1"} /><button className="adm-btn adm-btn--sm">{c.active ? "Desativar" : "Ativar"}</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
