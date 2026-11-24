import { ContactForm } from "@/components/admin/content-forms";
import { requireUser } from "@/lib/auth";
import { getSiteContent } from "@/lib/site-content";

export const metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser("configuracoes");
  const { contact } = await getSiteContent();
  return (
    <>
      <div className="adm-head"><div><h1>Configurações</h1><p>Contato oficial usado nos botões do site.</p></div></div>
      <div className="adm-card" style={{ maxWidth: 820 }}><ContactForm value={contact} /></div>
      <div className="adm-card" style={{ maxWidth: 820 }}>
        <h2>Rastreamento de campanhas</h2>
        <p className="adm-muted" style={{ margin: 0 }}>Os IDs do Google Tag Manager, Google Analytics e Meta Pixel ficam nas variáveis de ambiente da Vercel (NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_GA_ID e NEXT_PUBLIC_META_PIXEL_ID). Enquanto estiverem vazios, nenhum script de rastreamento é carregado.</p>
      </div>
    </>
  );
}
