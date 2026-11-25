import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { HomeNetwork } from "@/components/motion/home-network";
import { TransitionLink } from "@/components/page-transition";
import { IMOVEIS_URL } from "@/lib/site";
import "./home.css";

export const metadata: Metadata = {
  title: { absolute: "Avança | Imóveis, networking e negócios em Frutal, MG" },
  description: "Imóveis, conexões empresariais e novas oportunidades de negócios em Frutal e região.",
  alternates: { canonical: "/" },
};

// Cada área é representada só pelo símbolo da sua marca.
const routes = [
  {
    key: "imoveis", href: IMOVEIS_URL, variant: "imoveis" as const,
    brand: "Avança Imóveis", title: "Imóveis",
    text: "Encontre seu próximo imóvel ou oportunidade de investimento.",
    mark: "/brand/avanca-simbolo-preto-112.webp", markHover: "/brand/avanca-simbolo-branco-112.webp", h: 100,
  },
  {
    key: "eventos", href: "/eventos", variant: "negocios" as const,
    brand: "Avança Negócios", title: "Eventos",
    text: "Conecte-se a empresários e amplie suas oportunidades.",
    mark: "/brand/avanca-negocios-simbolo-112.webp", markHover: null, h: 99,
  },
  {
    key: "empresas", href: "/compra-e-venda-de-empresas", variant: "negocios" as const,
    brand: "Avança Negócios", title: "Compra e Venda de Empresas",
    text: "Encontre compradores ou novas oportunidades de aquisição.",
    mark: "/brand/avanca-negocios-simbolo-112.webp", markHover: null, h: 99,
  },
];

const imoveisOrigin = new URL(IMOVEIS_URL).origin;

export default function Home() {
  return (
    <main className="av">
      <HomeNetwork />
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
          {routes.map(({ key, href, variant, brand, title, text, mark, markHover, h }, i) => (
            <TransitionLink key={key} href={href} variant={variant} className={`av-route av-route--${key}`} data-route={key} style={{ "--i": i } as React.CSSProperties}>
              <span className="av-route__fill" aria-hidden="true" />
              <span className="av-route__mark" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mark} alt="" width={56} height={Math.round(h / 2)} decoding="async" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {markHover && <img className="av-route__mark-hover" src={markHover} alt="" width={56} height={Math.round(h / 2)} decoding="async" />}
              </span>
              <span className="av-route__body">
                <span className="av-route__brand">{brand}</span>
                <span className="av-route__title">{title}</span>
                <span className="av-route__text">{text}</span>
              </span>
              <span className="av-route__go" aria-hidden="true"><ArrowUpRight size={20} strokeWidth={1.6} /></span>
            </TransitionLink>
          ))}
        </nav>
      </div>
    </main>
  );
}
