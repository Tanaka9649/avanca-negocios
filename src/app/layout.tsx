import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AnalyticsScripts, UtmCapture } from "@/components/analytics";
import { PageTransitionProvider } from "@/components/page-transition";
import { SiteSettingsProvider } from "@/components/site-settings";
import { getSiteContent } from "@/lib/site-content";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Avança Negócios | Frutal, MG", template: "%s | Avança Negócios" },
  description: "Um ecossistema que conecta patrimônio, relacionamentos estratégicos e novas oportunidades empresariais em Frutal e região.",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Avança Negócios", images: [{ url: "/og.png", width: 1200, height: 630 }] },
};

export const viewport: Viewport = { themeColor: "#060a2b", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { contact } = await getSiteContent();
  return (
    <html lang="pt-BR">
      <body>
        <SiteSettingsProvider value={{ whatsapp: contact.whatsapp }}>
          <PageTransitionProvider>{children}</PageTransitionProvider>
        </SiteSettingsProvider>
        <UtmCapture />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
