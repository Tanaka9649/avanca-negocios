import { BrandLockup } from "@/components/brand";
import { TransitionLink } from "@/components/page-transition";
import { WhatsappLink } from "@/components/whatsapp-link";
import { IMOVEIS_URL, type WhatsappContext } from "@/lib/site";

export function SiteHeader({ current, whatsapp }: { current: "eventos" | "empresas" | "outra"; whatsapp: WhatsappContext }) {
  return (
    <header className="header">
      <div className="wrap header__inner">
        <TransitionLink href="/" aria-label="Avança Negócios, página inicial"><BrandLockup priority /></TransitionLink>
        <nav className="nav" aria-label="Operações">
          <TransitionLink href="/eventos" aria-current={current === "eventos" ? "page" : undefined}>Eventos e networking</TransitionLink>
          <TransitionLink href="/compra-e-venda-de-empresas" aria-current={current === "empresas" ? "page" : undefined}>Compra e venda de empresas</TransitionLink>
          <TransitionLink href={IMOVEIS_URL} variant="imoveis">Avança Imóveis</TransitionLink>
        </nav>
        <WhatsappLink context={whatsapp} className="btn btn--ghost header__cta">Conversar</WhatsappLink>
      </div>
    </header>
  );
}
