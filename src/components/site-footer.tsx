import { BrandLockup } from "@/components/brand";
import { TransitionLink } from "@/components/page-transition";
import { IMOVEIS_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <TransitionLink href="/" variant="avanca" aria-label="Avança, página inicial"><BrandLockup tone="dark" /></TransitionLink>
        <nav aria-label="Rodapé">
          <TransitionLink href="/eventos">Eventos</TransitionLink>
          <TransitionLink href="/compra-e-venda-de-empresas">Compra e venda de empresas</TransitionLink>
          <TransitionLink href={IMOVEIS_URL} variant="imoveis">Avança Imóveis</TransitionLink>
          <TransitionLink href="/privacidade">Política de Privacidade</TransitionLink>
        </nav>
        <span>Frutal, Minas Gerais</span>
      </div>
    </footer>
  );
}
