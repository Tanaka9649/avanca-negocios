import type { Metadata } from "next";
import { FernandaEventos } from "@/components/fernanda";
import { NetworkArt } from "@/components/motion/network-art";
import { SceneRoot } from "@/components/motion/scene-root";
import { ParticipatingCompanies } from "@/components/participating-companies";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UpcomingEvents } from "@/components/upcoming-events";
import { WhatsappLink } from "@/components/whatsapp-link";
import { getParticipatingCompanies, getUpcomingEvents } from "@/lib/public-data";
import { SITE_URL } from "@/lib/site";
import { getSiteContent } from "@/lib/site-content";
import "../negocios.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eventos e networking empresarial em Frutal",
  description: "O networking que conecta empresários de Frutal, MG. Amplie sua rede de contatos, construa parcerias estratégicas e encontre novas oportunidades de negócios.",
  alternates: { canonical: "/eventos" },
  openGraph: { title: "Avança Negócios — Eventos e networking em Frutal", url: "/eventos" },
};

const benefits = [
  { title: "Conexões estratégicas", text: "Novos relacionamentos comerciais com empresários de diferentes segmentos." },
  { title: "Oportunidades comerciais", text: "Parcerias estratégicas e novas oportunidades de negócio nascem da convivência." },
  { title: "Desenvolvimento empresarial", text: "Troca de experiências e de visão de mercado para crescer com consistência." },
  { title: "Relacionamentos de valor", text: "Conexões construídas com confiança e com visão de longo prazo." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Avança Negócios",
  url: `${SITE_URL}/eventos`,
  description: "Grupo de networking empresarial de Frutal, Minas Gerais.",
  areaServed: { "@type": "City", name: "Frutal" },
  address: { "@type": "PostalAddress", addressLocality: "Frutal", addressRegion: "MG", addressCountry: "BR" },
};

const words = (s: string) => s.split(" ").flatMap((w, i) => [i ? " " : null, <span key={i} className="word"><span data-final-word>{w}</span></span>]);

export default async function EventosPage() {
  const [events, companies, { fernanda }] = await Promise.all([getUpcomingEvents(), getParticipatingCompanies(), getSiteContent()]);

  return (
    <>
      <SiteHeader current="eventos" whatsapp="eventos" />
      <SceneRoot scenes="eventos" className="neg neg--eventos">
        <section className="ev-hero" aria-labelledby="ev-title" data-hero>
          <div className="wrap ev-hero__grid">
            <div className="ev-hero__copy" data-hero-copy>
              <h1 id="ev-title" className="display ev-hero__title">
                <span className="line-mask"><span>O networking que</span></span>
                <span className="line-mask"><span>conecta empresários</span></span>
                <span className="line-mask"><span>de Frutal.</span></span>
              </h1>
              <p className="lede fade-in">Amplie sua rede de contatos, construa parcerias estratégicas e encontre novas oportunidades de negócios.</p>
              <div className="actions fade-in">
                <WhatsappLink context="eventos" className="btn btn--ink">Quero fazer parte</WhatsappLink>
                <a href="#comunidade" className="btn btn--outline">Conheça a comunidade</a>
              </div>
            </div>
            <div className="ev-hero__art"><NetworkArt /></div>
          </div>
        </section>

        <FernandaEventos content={fernanda} />

        <ParticipatingCompanies companies={companies} />

        <section className="ev-community" id="comunidade" aria-labelledby="comunidade-title">
          <div className="wrap ev-community__grid">
            <p className="ev-community__place"><strong>Frutal</strong><span>Minas Gerais</span></p>
            <div>
              <h2 id="comunidade-title" className="h2">Um grupo de networking empresarial feito para Frutal.</h2>
              <p className="lede ev-community__lede">A Avança Negócios reúne empresários e profissionais de diferentes segmentos para trocar experiências, aproximar pessoas e abrir espaço para novas parcerias.</p>
            </div>
          </div>
        </section>

        <section className="ev-benefits" aria-labelledby="beneficios-title" data-benefits>
          <div className="wrap ev-benefits__grid">
            <div className="ev-benefits__sticky">
              <h2 id="beneficios-title" className="h2">O que muda quando você faz parte.</h2>
            </div>
            <div className="ev-benefits__listwrap" data-ben-list>
              <span className="ev-benefits__rail" aria-hidden="true"><span data-ben-line /></span>
              <ol className="ev-benefits__list">
              {benefits.map((b) => (
                <li key={b.title} className="ev-benefit" data-benefit>
                  <span className="ev-benefit__node" aria-hidden="true"><span data-ben-link /></span>
                  <h3 className="h3">{b.title}</h3>
                  <p className="body">{b.text}</p>
                </li>
              ))}
              </ol>
            </div>
          </div>
        </section>

        <UpcomingEvents events={events} />

        <section className="ev-final" aria-labelledby="final-title" data-final>
          <span className="ev-final__bg" aria-hidden="true" data-final-bg />
          <div className="wrap ev-final__inner">
            <h2 id="final-title" className="ev-final__title">{words("Sua próxima grande oportunidade pode começar com uma conversa.")}</h2>
            <div className="actions" data-final-after>
              <WhatsappLink context="eventos" className="btn btn--light">Quero fazer parte</WhatsappLink>
            </div>
          </div>
        </section>
      </SceneRoot>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
