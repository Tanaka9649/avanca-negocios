import type { Metadata } from "next";
import { FernandaSection } from "@/components/fernanda";
import { getSiteContent } from "@/lib/site-content";
import { ParticipatingCompanies } from "@/components/participating-companies";
import { ScrollSequence } from "@/components/scroll-sequence";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UpcomingEvents } from "@/components/upcoming-events";
import { WhatsappLink } from "@/components/whatsapp-link";
import { getParticipatingCompanies, getUpcomingEvents } from "@/lib/public-data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eventos e networking empresarial em Frutal",
  description: "Grupo de networking empresarial de Frutal, MG. Encontros que conectam empresários, conhecimento, relacionamentos e oportunidades de negócio.",
  alternates: { canonical: "/eventos" },
  openGraph: { title: "Avança Negócios — Eventos e networking em Frutal", url: "/eventos" },
};

const pillars = [
  { title: "Conexões estratégicas", text: "Conheça empresários e profissionais de diferentes segmentos." },
  { title: "Oportunidades comerciais", text: "Construa relacionamentos que favoreçam novas parcerias e negócios." },
  { title: "Desenvolvimento empresarial", text: "Compartilhe conhecimentos, experiências e perspectivas de mercado." },
  { title: "Relacionamentos de valor", text: "Fortaleça conexões profissionais com visão de longo prazo." },
];

function ConnectionArt() {
  return (
    <svg viewBox="0 0 600 560" aria-hidden="true">
      <defs>
        <linearGradient id="ev-grad" gradientUnits="userSpaceOnUse" x1="60" y1="70" x2="540" y2="480">
          <stop offset="0" stopColor="#e39282" />
          <stop offset="0.35" stopColor="#bc33f2" />
          <stop offset="0.6" stopColor="#862cd4" />
          <stop offset="1" stopColor="#3a52ff" />
        </linearGradient>
      </defs>
      <path className="edge" pathLength={1} d="M300 70 L540 480" />
      <path className="edge" pathLength={1} d="M540 480 L60 480" />
      <path className="edge" pathLength={1} d="M60 480 L300 70" />
      <path d="M300 250 L360 352 L240 352 Z" fill="none" stroke="rgba(242,241,246,0.18)" strokeWidth="1.2" strokeLinejoin="round" />
      <circle className="node" cx="300" cy="70" r="8" style={{ animationDelay: "0.2s" }} />
      <circle className="node" cx="540" cy="480" r="8" style={{ animationDelay: "0.6s" }} />
      <circle className="node" cx="60" cy="480" r="8" style={{ animationDelay: "1s" }} />
      <text className="label" x="300" y="40" textAnchor="middle" style={{ animationDelay: "0.4s" }}>Pessoas</text>
      <text className="label" x="540" y="516" textAnchor="middle" style={{ animationDelay: "0.8s" }}>Oportunidades</text>
      <text className="label" x="60" y="516" textAnchor="middle" style={{ animationDelay: "1.2s" }}>Conhecimento</text>
    </svg>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Avança Negócios",
  url: `${SITE_URL}/eventos`,
  description: "Grupo de networking empresarial de Frutal, Minas Gerais.",
  areaServed: { "@type": "City", name: "Frutal" },
  address: { "@type": "PostalAddress", addressLocality: "Frutal", addressRegion: "MG", addressCountry: "BR" },
};

export default async function EventosPage() {
  const [events, companies, { fernanda }] = await Promise.all([getUpcomingEvents(), getParticipatingCompanies(), getSiteContent()]);

  return (
    <>
      <SiteHeader current="eventos" whatsapp="eventos" />
      <main>
        <section className="ev-hero" aria-labelledby="ev-title">
          <div className="ev-hero__art"><ConnectionArt /></div>
          <div className="wrap ev-hero__inner">
            <h1 id="ev-title" className="display ev-hero__title">
              <span className="line-mask"><span>Grandes negócios</span></span>
              <span className="line-mask"><span>começam com</span></span>
              <span className="line-mask"><span>grandes conexões.</span></span>
            </h1>
            <p className="lede fade-in">Um ambiente criado para conectar empresários, compartilhar experiências e transformar relacionamentos em novas oportunidades de crescimento.</p>
            <div className="actions fade-in">
              <WhatsappLink context="eventos" className="btn btn--light">Quero fazer parte</WhatsappLink>
              <a href={events.length ? "#encontros" : "#networking"} className="btn btn--ghost">Conheça nossos encontros</a>
            </div>
          </div>
        </section>

        <FernandaSection content={fernanda} variant="eventos" />

        <ParticipatingCompanies companies={companies} />

        <section className="section white" id="networking" aria-labelledby="networking-title">
          <div className="wrap split">
            <div>
              <h2 id="networking-title" className="about__quote">O crescimento empresarial também acontece através das pessoas que você conhece.</h2>
              <p className="about__place"><strong>Frutal</strong><span>Minas Gerais</span></p>
            </div>
            <div style={{ alignSelf: "end" }}>
              <p className="body">A Avança Negócios é um grupo de networking empresarial de Frutal. Reúne empresários e profissionais de diferentes segmentos em encontros pensados para aproximar pessoas, trocar experiências e abrir espaço para novas parcerias.</p>
              <p className="body" style={{ marginTop: 16 }}>Mais do que um evento, é um ambiente de relacionamento contínuo, em que conhecimento e confiança se transformam em oportunidades comerciais.</p>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="beneficios-title">
          <div className="wrap">
            <h2 id="beneficios-title" className="h2" style={{ maxWidth: "15ch" }}>O que muda quando você faz parte.</h2>
            <ScrollSequence items={pillars} variant="chain" />
          </div>
        </section>

        <UpcomingEvents events={events} />

        <section className="section final" aria-labelledby="final-title">
          <div className="wrap final__inner">
            <h2 id="final-title" className="h2">Sua próxima grande oportunidade pode começar com uma conversa.</h2>
            <p className="lede" style={{ color: "rgba(255,255,255,0.78)" }}>Faça parte de um ambiente que valoriza conexões, conhecimento e crescimento empresarial.</p>
            <div className="actions"><WhatsappLink context="eventos" className="btn btn--light">Quero conhecer a Avança Negócios</WhatsappLink></div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
