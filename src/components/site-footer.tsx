import { BrandLockup } from "@/components/brand";
import { TransitionLink } from "@/components/page-transition";
import { IMOVEIS_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <TransitionLink href="/" aria-label="Avança Negócios, página inicial"><BrandLockup /></TransitionLink>
        <nav aria-label="Rodapé">
          <TransitionLink href="/eventos">Eventos e networking</TransitionLink>
          <TransitionLink href="/compra-e-venda-de-empresas">Compra e venda de empresas</TransitionLink>
          <TransitionLink href={IMOVEIS_URL} variant="imoveis">Avança Imóveis</TransitionLink>
          <TransitionLink href="/privacidade">Política de Privacidade</TransitionLink>
        </nav>
        <span>Frutal, Minas Gerais</span>
      </div>
    </footer>
  );
}
