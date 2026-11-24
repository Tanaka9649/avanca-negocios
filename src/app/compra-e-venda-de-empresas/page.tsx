import { LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import { FernandaSection } from "@/components/fernanda";
import { getSiteContent } from "@/lib/site-content";
import { LeadForms } from "@/components/lead-forms";
import { ScrollSequence } from "@/components/scroll-sequence";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Compra e venda de empresas em Frutal e região",
  description: "Conectamos empresários e investidores a oportunidades de compra e venda de empresas. Atendimento individual e confidencial.",
  alternates: { canonical: "/compra-e-venda-de-empresas" },
  openGraph: { title: "Avança Negócios — Compra e venda de empresas", url: "/compra-e-venda-de-empresas" },
};

const steps = [
  { title: "Primeiro contato", text: "Você nos conta, em poucas linhas, o que procura. Sem documentos nesta etapa." },
  { title: "Entendimento dos objetivos", text: "Uma conversa individual para compreender seus objetivos, prazos e o perfil do negócio." },
  { title: "Identificação do perfil e das oportunidades", text: "Avaliamos quais conexões fazem sentido para o que você busca." },
  { title: "Aproximação entre as partes", text: "Quando há aderência, aproximamos comprador e vendedor de forma cuidadosa." },
  { title: "Acompanhamento da negociação", text: "Seguimos próximos durante as conversas entre as partes." },
];

const sellers = [
  "Desejam vender suas empresas",
  "Estão planejando a aposentadoria",
  "Pretendem iniciar uma nova etapa profissional",
  "Buscam potenciais compradores",
  "Desejam avaliar novas oportunidades de negociação",
];

const buyers = [
  "Investidores",
  "Empreendedores",
  "Empresários interessados em expansão",
  "Pessoas interessadas em adquirir operações existentes",
  "Profissionais em transição para o empreendedorismo",
];

export const revalidate = 300;

export default async function CompraEVendaPage() {
  const { fernanda } = await getSiteContent();
  return (
    <>
      <SiteHeader current="empresas" whatsapp="institucional" />
      <main>
        <section className="mna-hero" aria-labelledby="mna-title">
          <span className="horizon" aria-hidden="true" />
          <div className="wrap mna-hero__inner">
            <h1 id="mna-title" className="display mna-hero__title">
              <span className="line-mask"><span>Grandes oportunidades.</span></span>
              <span className="line-mask"><span>Novos negócios.</span></span>
              <span className="line-mask"><span>Novos horizontes.</span></span>
            </h1>
            <p className="lede fade-in">Conectamos empresários e investidores a oportunidades de compra e venda de empresas, criando caminhos para novas etapas de crescimento empresarial.</p>
            <div className="actions fade-in">
              <a href="#vender" className="btn btn--light">Quero vender minha empresa</a>
              <a href="#comprar" className="btn btn--ghost">Quero comprar uma empresa</a>
            </div>
          </div>
        </section>

        <FernandaSection content={fernanda} variant="empresas" />

        <div className="sides">
          <section className="side side--sell" aria-labelledby="sell-title">
            <div className="side__inner">
              <h2 id="sell-title" className="h2">Toda trajetória empresarial pode ter um novo capítulo.</h2>
              <ul aria-label="Para empresários que">{sellers.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="body">O primeiro passo é compreender os seus objetivos e o perfil do seu negócio. A partir daí, avaliamos com você os caminhos possíveis.</p>
              <div className="actions" style={{ marginTop: 32 }}><a href="#vender" className="btn btn--dark">Quero vender minha empresa</a></div>
            </div>
          </section>
          <section className="side side--buy" aria-labelledby="buy-title">
            <div className="side__inner">
              <h2 id="buy-title" className="h2">O próximo passo do seu crescimento pode estar em um negócio que já existe.</h2>
              <ul aria-label="Para">{buyers.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="body">Comprar uma operação em funcionamento pode encurtar o caminho até o seu próximo objetivo. Conte o que procura e conversamos.</p>
              <div className="actions" style={{ marginTop: 32 }}><a href="#comprar" className="btn btn--light">Quero comprar uma empresa</a></div>
            </div>
          </section>
        </div>

        <section className="section white" aria-labelledby="como-title">
          <div className="wrap">
            <h2 id="como-title" className="h2" style={{ maxWidth: "12ch" }}>Como funciona.</h2>
            <ScrollSequence items={steps} variant="steps" />
          </div>
        </section>

        <section className="section deep" aria-labelledby="confid-title">
          <div className="wrap confid">
            <div>
              <span className="confid__mark"><LockKeyhole size={26} strokeWidth={1.5} aria-hidden="true" /></span>
              <h2 id="confid-title" className="h2" style={{ marginTop: 28, maxWidth: "14ch" }}>Grandes decisões exigem confiança e discrição.</h2>
            </div>
            <div>
              <p className="lede">Negociações empresariais envolvem informações sensíveis. Por isso, a confidencialidade orienta cada etapa do atendimento.</p>
              <p className="body" style={{ marginTop: 20 }}>As informações que você enviar são usadas apenas para compreender os interesses das partes e organizar o atendimento. Nenhum dado de empresas interessadas em venda é publicado neste site, e nesta primeira etapa não pedimos documentos financeiros.</p>
            </div>
          </div>
        </section>

        <section className="section light" aria-labelledby="form-title">
          <span id="vender" style={{ position: "relative", top: -24 }} />
          <span id="comprar" style={{ position: "relative", top: -24 }} />
          <div className="wrap forms">
            <div>
              <h2 id="form-title" className="h2" style={{ maxWidth: "12ch" }}>Vamos conversar sobre o seu próximo passo.</h2>
              <p className="body" style={{ marginTop: 20 }}>Preencha as informações iniciais. O atendimento é individual e segue pelo WhatsApp.</p>
            </div>
            <LeadForms />
          </div>
        </section>

        <section className="section final" aria-labelledby="final-title">
          <div className="wrap final__inner">
            <h2 id="final-title" className="h2">O futuro dos seus negócios começa com uma decisão.</h2>
            <div className="actions">
              <a href="#vender" className="btn btn--light">Quero vender minha empresa</a>
              <a href="#comprar" className="btn btn--ghost">Quero comprar uma empresa</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
