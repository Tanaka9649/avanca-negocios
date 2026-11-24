import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CompanyForm } from "@/components/admin/company-form";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Nova empresa" };

export default async function NewCompanyPage() {
  await requireUser("empresas");
  return (
    <>
      <Link className="adm-back" href="/admin/empresas"><ArrowLeft size={16} />Empresas participantes</Link>
      <div className="adm-head"><div><h1>Nova empresa</h1></div></div>
      <div className="adm-card" style={{ maxWidth: 820 }}><CompanyForm values={{ name: "", segment: "", instagram: "", website: "", logoUrl: null, active: true }} /></div>
    </>
  );
}
