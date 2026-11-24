import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const optional = (max: number) => text(max).optional().transform((v) => (v ? v : undefined));

const phone = z.string().trim().transform((v) => v.replace(/\D/g, "")).refine((v) => v.length >= 10 && v.length <= 13, "Informe o WhatsApp com DDD.");

const tracking = z.object({
  utmSource: optional(120), utmMedium: optional(120), utmCampaign: optional(160),
  utmTerm: optional(160), utmContent: optional(160), referrer: optional(500), landingPath: optional(300),
}).partial().default({});

const base = {
  name: text(120).min(3, "Informe seu nome completo."),
  whatsapp: phone,
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(160),
  city: text(80).min(2, "Informe a cidade."),
  state: text(2).toUpperCase().regex(/^[A-Z]{2}$/, "Informe a UF com duas letras."),
  message: optional(1500),
  consent: z.literal(true, { error: "É preciso concordar com a Política de Privacidade." }),
  website: z.string().max(0).optional(), // honeypot
  startedAt: z.number().int().optional(),
  tracking,
};

export const sellLeadSchema = z.object({
  kind: z.literal("venda_empresa"),
  ...base,
  segment: text(120).min(2, "Informe o segmento da empresa."),
  operatingTime: text(60).min(1, "Informe o tempo de operação."),
  revenueRange: optional(60),
  priceExpectation: optional(60),
});

export const buyLeadSchema = z.object({
  kind: z.literal("compra_empresa"),
  ...base,
  segment: text(120).min(2, "Informe o segmento de interesse."),
  region: text(120).min(2, "Informe a região de interesse."),
  investmentRange: optional(60),
  goal: text(300).min(3, "Conte o objetivo da aquisição."),
});

export const leadSchema = z.discriminatedUnion("kind", [sellLeadSchema, buyLeadSchema]);
export type LeadInput = z.input<typeof leadSchema>;

export const REVENUE_RANGES = ["Até R$ 360 mil por ano", "R$ 360 mil a R$ 1 milhão", "R$ 1 milhão a R$ 4,8 milhões", "R$ 4,8 milhões a R$ 20 milhões", "Acima de R$ 20 milhões", "Prefiro informar na conversa"];
export const INVESTMENT_RANGES = ["Até R$ 300 mil", "R$ 300 mil a R$ 1 milhão", "R$ 1 milhão a R$ 3 milhões", "R$ 3 milhões a R$ 10 milhões", "Acima de R$ 10 milhões", "Prefiro informar na conversa"];
export const OPERATING_TIMES = ["Menos de 2 anos", "2 a 5 anos", "5 a 10 anos", "10 a 20 anos", "Mais de 20 anos"];
