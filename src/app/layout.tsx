import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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

// Onest servida pelo próprio site, com pré-carregamento e fonte de reserva ajustada (evita salto de layout).
const onest = localFont({
  src: [
    { path: "./fonts/onest-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/onest-latin-ext-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-onest",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

export const viewport: Viewport = { themeColor: "#fafafa", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { contact } = await getSiteContent();
  return (
    <html lang="pt-BR" className={onest.variable}>
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
