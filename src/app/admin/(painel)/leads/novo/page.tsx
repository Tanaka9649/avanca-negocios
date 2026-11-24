import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ManualLeadForm } from "@/components/admin/manual-lead-form";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Novo lead" };

export default async function NewLeadPage() {
  await requireUser("leads");
  return (
    <>
      <Link className="adm-back" href="/admin/leads"><ArrowLeft size={16} />Leads</Link>
      <div className="adm-head"><div><h1>Novo lead</h1><p>Para contatos que chegaram por WhatsApp, indicação ou encontros presenciais.</p></div></div>
      <div className="adm-card" style={{ maxWidth: 760 }}><ManualLeadForm /></div>
    </>
  );
}
