import "server-only";
import { inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { businessSettings, institutionalContent } from "@/db/schema";
import { WHATSAPP_NUMBER } from "@/lib/site";

export const fernandaSchema = z.object({
  photoUrl: z.string().max(300),
  photoAlt: z.string().max(200),
  roles: z.array(z.object({ title: z.string().max(80), org: z.string().max(80) })).max(8),
  eventosHeadline: z.string().max(160),
  eventosParagraphs: z.array(z.string().max(900)).max(4),
  empresasHeadline: z.string().max(160),
  empresasParagraphs: z.array(z.string().max(900)).max(4),
});
export type FernandaContent = z.infer<typeof fernandaSchema>;

export const contactSchema = z.object({
  whatsapp: z.string().regex(/^\d{12,13}$/),
  email: z.string().max(160),
  instagram: z.string().max(200),
  facebook: z.string().max(200),
  linkedin: z.string().max(200),
});
export type ContactSettings = z.infer<typeof contactSchema>;

export const DEFAULT_FERNANDA: FernandaContent = {
  photoUrl: "/pessoas/fernanda.webp",
  photoAlt: "Fernanda, CEO da Avança Imóveis e da Avança Negócios",
  roles: [
    { title: "CEO", org: "Avança Imóveis" },
    { title: "CEO", org: "Avança Negócios" },
    { title: "Empreendedora", org: "" },
    { title: "Mentora de grandes negócios", org: "" },
  ],
  eventosHeadline: "Conectando pessoas que transformam negócios.",
  eventosParagraphs: [
    "À frente da Avança Imóveis e da Avança Negócios, Fernanda reúne visão empreendedora, liderança e uma atuação voltada à construção de relacionamentos estratégicos.",
    "Como empresária e mentora de grandes negócios, acredita no potencial das conexões para gerar oportunidades, compartilhar conhecimento e impulsionar o desenvolvimento empresarial.",
  ],
  empresasHeadline: "Visão empresarial para decisões que transformam negócios.",
  empresasParagraphs: [
    "À frente da Avança Imóveis e da Avança Negócios, Fernanda atua com uma visão voltada ao desenvolvimento empresarial, à construção de relacionamentos estratégicos e à identificação de novas oportunidades.",
    "Sua atuação como empreendedora e mentora de grandes negócios contribui para uma abordagem que valoriza o entendimento dos objetivos de cada empresário e a construção de conexões relevantes.",
  ],
};

export const DEFAULT_CONTACT: ContactSettings = { whatsapp: WHATSAPP_NUMBER, email: "", instagram: "", facebook: "", linkedin: "" };

export const SITE_CONTENT_TAG = "site-content";

async function load() {
  if (!db) return { fernanda: DEFAULT_FERNANDA, contact: DEFAULT_CONTACT };
  try {
    const [content, settings] = await Promise.all([
      db.select().from(institutionalContent).where(inArray(institutionalContent.key, ["fernanda"])),
      db.select().from(businessSettings).where(inArray(businessSettings.key, ["contato"])),
    ]);
    const f = fernandaSchema.partial().safeParse(content.find((r) => r.key === "fernanda")?.value ?? {});
    const c = contactSchema.partial().safeParse(settings.find((r) => r.key === "contato")?.value ?? {});
    return {
      fernanda: { ...DEFAULT_FERNANDA, ...(f.success ? f.data : {}) },
      contact: { ...DEFAULT_CONTACT, ...(c.success ? c.data : {}) },
    };
  } catch {
    return { fernanda: DEFAULT_FERNANDA, contact: DEFAULT_CONTACT };
  }
}

export const getSiteContent = unstable_cache(load, ["site-content-v1"], { tags: [SITE_CONTENT_TAG], revalidate: 3600 });
