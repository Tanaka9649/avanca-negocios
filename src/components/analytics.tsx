"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GTM = process.env.NEXT_PUBLIC_GTM_ID;
const GA = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window { dataLayer?: unknown[]; fbq?: (...args: unknown[]) => void; gtag?: (...args: unknown[]) => void }
}

/** Dispara eventos de conversão sem dados pessoais. Chame só depois da ação confirmada. */
export function track(event: string, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  window.gtag?.("event", event, params);
  if (window.fbq) {
    const standard: Record<string, string> = { generate_lead: "Lead", whatsapp_click: "Contact" };
    if (standard[event]) window.fbq("track", standard[event], params); else window.fbq("trackCustom", event, params);
  }
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Guarda a origem da primeira visita da sessão para registrar junto com o lead. */
export function UtmCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("an_attribution")) return;
      const p = new URLSearchParams(window.location.search);
      const data: Record<string, string> = {};
      for (const k of UTM_KEYS) { const v = p.get(k); if (v) data[k] = v.slice(0, 160); }
      if (document.referrer && !document.referrer.startsWith(window.location.origin)) data.referrer = document.referrer.slice(0, 500);
      data.landing_path = window.location.pathname;
      sessionStorage.setItem("an_attribution", JSON.stringify(data));
    } catch { /* armazenamento indisponível */ }
  }, []);
  return null;
}

export function readAttribution() {
  try {
    const d = JSON.parse(sessionStorage.getItem("an_attribution") ?? "{}") as Record<string, string>;
    return { utmSource: d.utm_source, utmMedium: d.utm_medium, utmCampaign: d.utm_campaign, utmTerm: d.utm_term, utmContent: d.utm_content, referrer: d.referrer, landingPath: d.landing_path };
  } catch {
    return {};
  }
}

export function AnalyticsScripts() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      {GTM && (
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');`}</Script>
      )}
      {GA && !GTM && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}');`}</Script>
        </>
      )}
      {PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
