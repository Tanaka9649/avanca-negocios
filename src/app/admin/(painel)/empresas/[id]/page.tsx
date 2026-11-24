import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyForm } from "@/components/admin/company-form";
import { requireDb } from "@/db";
import { participatingCompanies } from "@/db/schema";
import { deleteCompany } from "@/lib/admin/company-actions";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Editar empresa" };

export default async function EditCompanyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser("empresas");
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [c] = await requireDb().select().from(participatingCompanies).where(eq(participatingCompanies.id, id)).limit(1);
  if (!c) notFound();
  return (
    <>
      <Link className="adm-back" href="/admin/empresas"><ArrowLeft size={16} />Empresas participantes</Link>
      {sp.erro === "confirmacao" && <p className="adm-alert" style={{ marginBottom: 16 }}>Marque a confirmação para excluir a empresa.</p>}
      <div className="adm-head"><div><h1>{c.name}</h1></div></div>
      <div className="adm-grid adm-grid--side">
        <div className="adm-card"><CompanyForm values={{ id: c.id, name: c.name, segment: c.segment ?? "", instagram: c.instagram ?? "", website: c.website ?? "", logoUrl: c.logoUrl, active: c.active }} /></div>
        <section className="adm-card">
          <h2>Excluir empresa</h2>
          <p className="adm-muted" style={{ fontSize: 14 }}>Para apenas tirar do site, desative em vez de excluir.</p>
          <form action={deleteCompany} className="adm-form">
            <input type="hidden" name="id" value={c.id} />
            <label className="adm-check"><input type="checkbox" name="confirm" required />Confirmo a exclusão definitiva.</label>
            <div><button className="adm-btn adm-btn--danger">Excluir empresa</button></div>
          </form>
        </section>
      </div>
    </>
  );
}
