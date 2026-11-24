import { FernandaForm } from "@/components/admin/content-forms";
import { requireUser } from "@/lib/auth";
import { getSiteContent } from "@/lib/site-content";

export const metadata = { title: "Conteúdo institucional" };
export const dynamic = "force-dynamic";

export default async function ContentPage() {
  await requireUser("conteudo");
  const { fernanda } = await getSiteContent();
  return (
    <>
      <div className="adm-head"><div><h1>Conteúdo institucional</h1><p>Foto, cargos e textos da Fernanda nas páginas de eventos e de compra e venda. O layout das páginas não muda.</p></div></div>
      <div style={{ maxWidth: 900 }}><FernandaForm value={fernanda} /></div>
    </>
  );
}
