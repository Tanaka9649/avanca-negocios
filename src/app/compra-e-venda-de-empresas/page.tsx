import { LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import { FernandaEmpresas } from "@/components/fernanda";
import { LeadForms } from "@/components/lead-forms";
import { SceneRoot } from "@/components/motion/scene-root";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteContent } from "@/lib/site-content";
import "../negocios.css";

export const metadata: Metadata = {
  title: "Compra e venda de empresas em Frutal e região",
  description: "Conectamos empresários e investidores para facilitar novas oportunidades de aquisição e venda de negócios, com atendimento individualizado e confidencial.",
  alternates: { canonical: "/compra-e-venda-de-empresas" },
  openGraph: { title: "Avança Negócios — Compra e venda de empresas", url: "/compra-e-venda-de-empresas" },
};

export const revalidate = 300;

const steps = [
  { title: "Primeiro contato", text: "Você conta, em poucas linhas, o que procura. Sem documentos nesta etapa." },
  { title: "Entendimento dos objetivos", text: "Uma conversa individual sobre objetivos, prazos e perfil do negócio." },
  { title: "Identificação de oportunidades", text: "Avaliamos quais conexões fazem sentido para o que você busca." },
  { title: "Aproximação entre as partes", text: "Quando há aderência, aproximamos comprador e vendedor com cuidado." },
  { title: "Acompanhamento da negociação", text: "Seguimos próximos durante as conversas entre as partes." },
];

const sellers = ["Quer vender ou passar a empresa adiante", "Planeja aposentadoria ou uma nova etapa", "Busca compradores com discrição"];
const buyers = ["Investidores e empreendedores", "Empresas em expansão", "Quem prefere começar por uma operação existente"];

const words = (s: string) => s.split(" ").flatMap((w, i) => [i ? " " : null, <span key={i} className="word"><span data-final-word>{w}</span></span>]);

export default async function CompraEVendaPage() {
  const { fernanda } = await getSiteContent();
  return (
    <>
      <SiteHeader current="empresas" whatsapp="institucional" />
      <SceneRoot scenes="empresas" className="neg neg--empresas">
        <section className="mna-hero" aria-labelledby="mna-title" data-mna-hero>
          <span className="mna-hero__horizon mna-hero__horizon--top" aria-hidden="true" data-horizon-top />
          <span className="mna-hero__horizon mna-hero__horizon--bottom" aria-hidden="true" data-horizon-bottom />
          <div className="wrap mna-hero__inner" data-mna-copy>
            <h1 id="mna-title" className="display mna-hero__title">
              <span className="line-mask"><span>Quer comprar ou</span></span>
              <span className="line-mask"><span>vender uma empresa?</span></span>
            </h1>
            <div className="mna-hero__foot">
              <p className="lede fade-in">Conectamos empresários e investidores para facilitar novas oportunidades de aquisição e venda de negócios, com atendimento individualizado e confidencial.</p>
              <div className="actions fade-in">
                <a href="#vender" className="btn btn--ink">Quero vender minha empresa</a>
                <a href="#comprar" className="btn btn--outline">Quero comprar uma empresa</a>
              </div>
            </div>
          </div>
        </section>

        <FernandaEmpresas content={fernanda} />

        <section className="paths" aria-label="Para quem é" data-paths>
          <div className="wrap paths__grid">
            <article className="path path--sell" data-path-col="sell" aria-labelledby="sell-title">
              <p className="path__tag">Vender</p>
              <h2 id="sell-title" className="h3 path__title">Um novo capítulo para a sua empresa.</h2>
              <ul>{sellers.map((s) => <li key={s}>{s}</li>)}</ul>
              <a href="#vender" className="path__link">Quero vender minha empresa</a>
            </article>
            <article className="path path--buy" data-path-col="buy" aria-labelledby="buy-title">
              <p className="path__tag">Comprar</p>
              <h2 id="buy-title" className="h3 path__title">Crescer a partir de um negócio que já funciona.</h2>
              <ul>{buyers.map((s) => <li key={s}>{s}</li>)}</ul>
              <a href="#comprar" className="path__link">Quero comprar uma empresa</a>
            </article>
          </div>
          <div className="converge" data-converge aria-hidden="true">
            <svg viewBox="0 0 1000 220" preserveAspectRatio="none">
              <path data-converge-line pathLength={1} d="M250 0 V60 C250 150 500 110 500 200" />
              <path data-converge-line pathLength={1} d="M750 0 V60 C750 150 500 110 500 200" />
            </svg>
            <span className="converge__dot" data-converge-dot />
            <span className="converge__label" data-converge-label>Um atendimento para as duas pontas</span>
          </div>
        </section>

        <section className="steps" aria-labelledby="como-title" data-steps>
          <div className="wrap steps__grid">
            <div className="steps__sticky">
              <h2 id="como-title" className="h2">Como funciona.</h2>
              <p className="body">Cinco etapas, do primeiro contato ao acompanhamento da negociação.</p>
            </div>
            <div className="steps__listwrap" data-steps-list>
              <span className="steps__rail" aria-hidden="true"><span data-steps-progress /></span>
              <ol className="steps__list">
                {steps.map((s, i) => (
                  <li key={s.title} className="step" data-step>
                    <span className="step__num" aria-hidden="true">{i + 1}</span>
                    <h3 className="h3">{s.title}</h3>
                    <p className="body">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="confid" aria-labelledby="confid-title" data-confid>
          <span className="confid__bg" aria-hidden="true" data-confid-bg />
          <div className="wrap confid__grid">
            <span className="confid__lock" data-confid-lock><LockKeyhole size={26} strokeWidth={1.5} aria-hidden="true" /></span>
            <h2 id="confid-title" className="h2">Grandes decisões exigem confiança e discrição.</h2>
            <div className="confid__text">
              <p>As informações enviadas servem apenas para compreender os interesses das partes e organizar o atendimento.</p>
              <p>Nenhum dado de empresas à venda é publicado neste site, e nesta primeira etapa não pedimos documentos financeiros.</p>
            </div>
          </div>
        </section>

        <section className="mna-form" aria-labelledby="form-title" id="formulario">
          <span id="vender" className="anchor" />
          <span id="comprar" className="anchor" />
          <div className="wrap mna-form__grid">
            <div>
              <h2 id="form-title" className="h2">Vamos conversar sobre o seu próximo passo.</h2>
              <p className="body" style={{ marginTop: 20 }}>Duas etapas curtas. O atendimento é individual e segue pelo WhatsApp.</p>
            </div>
            <LeadForms />
          </div>
        </section>

        <section className="mna-final" aria-labelledby="final-title" data-mna-final>
          <div className="wrap mna-final__inner">
            <h2 id="final-title" className="mna-final__title">{words("O próximo capítulo do seu negócio começa com uma conversa.")}</h2>
            <div className="actions" data-final-after>
              <a href="#vender" className="btn btn--light">Quero vender minha empresa</a>
              <a href="#comprar" className="btn btn--ghost">Quero comprar uma empresa</a>
            </div>
          </div>
        </section>
      </SceneRoot>
      <SiteFooter />
    </>
  );
}
