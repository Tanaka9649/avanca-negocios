import Image from "next/image";
import { ArrowRight, Building2, Handshake, Users } from "lucide-react";
import type { Metadata } from "next";
import { BrandLockup } from "@/components/brand";
import { TransitionLink } from "@/components/page-transition";
import { IMOVEIS_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Avança Negócios | Imóveis, networking e compra e venda de empresas em Frutal" },
  alternates: { canonical: "/" },
};

const routes = [
  {
    key: "imoveis", href: IMOVEIS_URL, variant: "imoveis" as const, icon: Building2,
    title: "Avança Imóveis",
    text: "Encontre oportunidades imobiliárias e soluções para comprar, vender e investir.",
  },
  {
    key: "eventos", href: "/eventos", variant: "negocios" as const, icon: Users,
    title: "Eventos e Networking",
    text: "Conecte-se a empresários, fortaleça relacionamentos e amplie suas oportunidades de negócios.",
  },
  {
    key: "empresas", href: "/compra-e-venda-de-empresas", variant: "negocios" as const, icon: Handshake,
    title: "Compra e Venda de Empresas",
    text: "Conectamos empresários e investidores a novas possibilidades de crescimento.",
  },
];

export default function Home() {
  return (
    <main className="home">
      <div className="wrap home__inner">
        <div className="home__top">
          <span className="sr-only">Avança Negócios</span>
          <span className="home__place">Frutal, Minas Gerais</span>
        </div>

        <div className="home__grid">
          <div>
            <div className="home__symbol">
              <Image src="/brand/avanca-negocios-simbolo.png" alt="Avança Negócios" width={416} height={369} priority />
            </div>
            <h1 className="display home__title">
              <span className="line-mask"><span>Conectamos pessoas.</span></span>
              <span className="line-mask"><span>Criamos oportunidades.</span></span>
              <span className="line-mask"><span>Transformamos negócios.</span></span>
            </h1>
            <p className="lede home__lede fade-in">
              Um ecossistema que conecta patrimônio, relacionamentos estratégicos e novas oportunidades empresariais.
            </p>
          </div>

          <nav aria-label="Escolha a operação">
            <ul className="routes">
              {routes.map(({ key, href, variant, icon: Icon, title, text }) => (
                <li key={key} className={`route route--${key}`}>
                  <TransitionLink href={href} variant={variant} className="route__link">
                    <span className="route__icon"><Icon size={20} strokeWidth={1.6} aria-hidden="true" /></span>
                    <span>
                      <span className="route__title">{title}</span>
                      <span className="route__text">{text}</span>
                    </span>
                    <ArrowRight className="route__arrow" size={22} strokeWidth={1.6} aria-hidden="true" />
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="home__foot">
          <BrandLockup />
          <TransitionLink href="/privacidade">Política de Privacidade</TransitionLink>
        </div>
      </div>
    </main>
  );
}
