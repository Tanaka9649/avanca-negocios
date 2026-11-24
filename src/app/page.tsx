import { ArrowUpRight, Building2, Handshake, Users } from "lucide-react";
import type { Metadata } from "next";
import { TransitionLink } from "@/components/page-transition";
import { IMOVEIS_URL } from "@/lib/site";
import "./home.css";

export const metadata: Metadata = {
  title: { absolute: "Avança | Imóveis, networking e negócios em Frutal, MG" },
  description: "Imóveis, conexões empresariais e novas oportunidades de negócios em Frutal e região.",
  alternates: { canonical: "/" },
};

const routes = [
  {
    key: "imoveis", href: IMOVEIS_URL, variant: "imoveis" as const, icon: Building2,
    brand: "Avança Imóveis", title: "Imóveis",
    text: "Encontre seu próximo imóvel ou oportunidade de investimento.",
    mark: "/brand/avanca-imoveis-simbolo-branco.png",
  },
  {
    key: "eventos", href: "/eventos", variant: "negocios" as const, icon: Users,
    brand: "Avança Negócios", title: "Eventos",
    text: "Conecte-se a empresários e amplie suas oportunidades.",
    mark: "/brand/avanca-negocios-simbolo.png",
  },
  {
    key: "empresas", href: "/compra-e-venda-de-empresas", variant: "negocios" as const, icon: Handshake,
    brand: "Avança Negócios", title: "Compra e Venda de Empresas",
    text: "Encontre compradores ou novas oportunidades de aquisição.",
    mark: "/brand/avanca-negocios-simbolo.png",
  },
];

const imoveisOrigin = new URL(IMOVEIS_URL).origin;

export default function Home() {
  return (
    <main className="av">
      <link rel="preconnect" href={imoveisOrigin} />
      <link rel="dns-prefetch" href={imoveisOrigin} />
      <div className="av__inner">
        <header className="av__top">
          <span>Frutal, Minas Gerais</span>
          <TransitionLink href="/privacidade" variant="avanca">Privacidade</TransitionLink>
        </header>

        <section className="av__hero" aria-labelledby="av-title">
          <div className="av__mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/avanca-simbolo-preto.png" alt="Avança" width={436} height={388} fetchPriority="high" />
          </div>
          <h1 id="av-title" className="av__title">
            <span className="line-mask"><span>Grandes oportunidades</span></span>
            <span className="line-mask"><span>começam aqui.</span></span>
          </h1>
          <p className="av__lede">Imóveis, conexões empresariais e novas oportunidades de negócios. Conheça nossas áreas de atuação.</p>
        </section>

        <nav className="av__routes" aria-label="Áreas de atuação">
          {routes.map(({ key, href, variant, icon: Icon, brand, title, text, mark }, i) => (
            <TransitionLink key={key} href={href} variant={variant} className={`av-route av-route--${key}`} style={{ "--i": i } as React.CSSProperties}>
              <span className="av-route__fill" aria-hidden="true" />
              <span className="av-route__top">
                <Icon className="av-route__icon" size={22} strokeWidth={1.5} aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="av-route__mark" src={mark} alt="" width={436} height={388} loading="lazy" />
              </span>
              <span className="av-route__brand">{brand}</span>
              <span className="av-route__title">{title}</span>
              <span className="av-route__text">{text}</span>
              <span className="av-route__go" aria-hidden="true"><ArrowUpRight size={22} strokeWidth={1.5} /></span>
            </TransitionLink>
          ))}
        </nav>
      </div>
    </main>
  );
}
