import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CONSENT_VERSION } from "@/lib/site";

export const metadata: Metadata = { title: "Política de Privacidade", alternates: { canonical: "/privacidade" }, robots: { index: true } };

export default function PrivacidadePage() {
  return (
    <>
      <SiteHeader current="outra" whatsapp="institucional" />
      <main className="section light" style={{ paddingTop: 160 }}>
        <div className="wrap prose">
          <h1 className="h2">Política de Privacidade</h1>
          <p>Versão de {CONSENT_VERSION.split("-").reverse().join("/")}.</p>
          <h2>Quais dados coletamos</h2>
          <p>Nos formulários deste site coletamos nome, WhatsApp, e-mail, cidade, estado e as informações sobre o seu interesse que você decidir informar. Também registramos a página de origem e parâmetros de campanha (UTM) para entender como você chegou até nós. O endereço IP é guardado apenas em forma cifrada, para proteção contra abuso.</p>
          <h2>Para que usamos</h2>
          <p>Os dados são usados exclusivamente para entrar em contato com você, compreender o seu interesse e conduzir o atendimento. Não vendemos nem compartilhamos dados pessoais com terceiros para fins comerciais.</p>
          <h2>Ferramentas de medição</h2>
          <p>Podemos usar ferramentas de medição de audiência e de anúncios. Elas recebem apenas informações de navegação e de conversão, nunca o conteúdo dos formulários.</p>
          <h2>Por quanto tempo guardamos</h2>
          <p>Os dados ficam armazenados enquanto forem necessários ao atendimento ou até que você peça a exclusão.</p>
          <h2>Seus direitos</h2>
          <p>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo nosso WhatsApp oficial, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
