export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const IMOVEIS_URL = (process.env.NEXT_PUBLIC_IMOVEIS_URL ?? "https://imoveisplatform.vercel.app").replace(/\/$/, "");

/** Somente dígitos, com DDI. Número confirmado pelo cliente em 24/11/2026: (34) 99974-0775. */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5534999740775").replace(/\D/g, "");

export type WhatsappContext = "eventos" | "venda" | "compra" | "institucional";

export const WHATSAPP_MESSAGES: Record<WhatsappContext, string> = {
  eventos: "Olá! Conheci a Avança Negócios pelo site e gostaria de saber mais sobre os encontros empresariais e como posso participar.",
  venda: "Olá! Conheci a Avança Negócios pelo site e gostaria de conversar sobre a possibilidade de vender minha empresa.",
  compra: "Olá! Conheci a Avança Negócios pelo site e gostaria de saber mais sobre oportunidades de aquisição de empresas.",
  institucional: "Olá! Conheci a Avança Negócios pelo site e gostaria de conversar.",
};

export function whatsappUrl(context: WhatsappContext, extra?: string, number = WHATSAPP_NUMBER) {
  const text = extra ? `${WHATSAPP_MESSAGES[context]} ${extra}` : WHATSAPP_MESSAGES[context];
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export const CONSENT_VERSION = "2026-11-24";
