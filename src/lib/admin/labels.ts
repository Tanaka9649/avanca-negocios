export const LEAD_STATUSES = ["novo", "contato_realizado", "em_qualificacao", "reuniao_agendada", "em_negociacao", "concluido", "perdido"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo lead", contato_realizado: "Contato realizado", em_qualificacao: "Em qualificação",
  reuniao_agendada: "Reunião agendada", em_negociacao: "Em negociação", concluido: "Concluído", perdido: "Perdido",
};

export const LEAD_CATEGORIES = ["eventos", "networking", "compra_empresa", "venda_empresa", "institucional"] as const;
export type LeadCategory = (typeof LEAD_CATEGORIES)[number];
export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  eventos: "Eventos", networking: "Networking", compra_empresa: "Compra de empresa", venda_empresa: "Venda de empresa", institucional: "Contato institucional",
};

export const SOURCE_LABELS: Record<string, string> = { formulario: "Formulário do site", whatsapp: "WhatsApp", manual: "Cadastro manual" };

export const DETAIL_LABELS: Record<string, string> = {
  segmento: "Segmento da empresa", tempoDeOperacao: "Tempo de operação", faixaDeFaturamento: "Faixa de faturamento", expectativaDeValor: "Expectativa de valor",
  segmentoDeInteresse: "Segmento de interesse", regiaoDeInteresse: "Região de interesse", objetivo: "Objetivo da aquisição", faixaDeInvestimento: "Faixa de investimento",
};

export const EVENT_STATUS_LABELS: Record<string, string> = { agendado: "Agendado", vagas_limitadas: "Vagas limitadas", encerrado: "Encerrado", cancelado: "Cancelado" };

const TZ = "America/Sao_Paulo";
export const fmtDate = (d: Date | null | undefined) => (d ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: TZ }).format(d) : "—");
export const fmtDateTime = (d: Date | null | undefined) => (d ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: TZ }).format(d) : "—");

/** Converte Date para o valor de <input type="datetime-local"> no fuso de Brasília. */
export function toLocalInput(d: Date | null | undefined) {
  if (!d) return "";
  const p = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
  return p.replace(" ", "T");
}
/** Interpreta o valor de <input type="datetime-local"> como horário de Brasília (UTC−3, sem horário de verão). */
export function fromLocalInput(v: string | null | undefined) {
  if (!v) return null;
  const d = new Date(`${v}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function phoneDigits(v: string) { return v.replace(/\D/g, ""); }
export function waLink(phone: string) {
  const d = phoneDigits(phone);
  return `https://wa.me/${d.startsWith("55") && d.length > 11 ? d : `55${d}`}`;
}
export function fmtPhone(v: string) {
  const d = phoneDigits(v).replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return v;
}
