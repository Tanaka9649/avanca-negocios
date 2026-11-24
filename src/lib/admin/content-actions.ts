"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireDb } from "@/db";
import { businessSettings, institutionalContent } from "@/db/schema";
import { audit } from "@/lib/admin/audit";
import { deleteImageByUrl, fileFrom, MediaError, saveImage } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth";
import { contactSchema, fernandaSchema, getSiteContent, SITE_CONTENT_TAG } from "@/lib/site-content";

export type ContentState = { error?: string; ok?: string } | undefined;

function refreshSite() {
  updateTag(SITE_CONTENT_TAG);
  revalidatePath("/", "layout");
}

const paragraphs = (v: FormDataEntryValue | null) => String(v ?? "").split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);

export async function saveFernanda(_: ContentState, formData: FormData): Promise<ContentState> {
  const user = await requireUser("conteudo");
  const { fernanda: current } = await getSiteContent();
  let photoUrl = current.photoUrl;
  const file = fileFrom(formData, "photo");
  try {
    if (file) photoUrl = await saveImage(file, "institucional", user.id);
  } catch (e) {
    return { error: e instanceof MediaError ? e.message : "Falha ao salvar a foto." };
  }
  if (formData.get("resetPhoto") === "on" && !file) photoUrl = "/pessoas/fernanda.webp";

  const roles = [0, 1, 2, 3, 4, 5].map((i) => ({ title: String(formData.get(`role${i}`) ?? "").trim(), org: String(formData.get(`org${i}`) ?? "").trim() })).filter((r) => r.title);
  const parsed = fernandaSchema.safeParse({
    photoUrl, photoAlt: String(formData.get("photoAlt") ?? "").trim() || current.photoAlt, roles,
    eventosHeadline: String(formData.get("eventosHeadline") ?? "").trim(), eventosParagraphs: paragraphs(formData.get("eventosParagraphs")),
    empresasHeadline: String(formData.get("empresasHeadline") ?? "").trim(), empresasParagraphs: paragraphs(formData.get("empresasParagraphs")),
  });
  if (!parsed.success) return { error: "Revise os textos: títulos até 160 caracteres, até 4 parágrafos de 900 caracteres e até 6 cargos." };
  if (!parsed.data.eventosHeadline || !parsed.data.empresasHeadline) return { error: "Os dois títulos são obrigatórios." };

  await requireDb().insert(institutionalContent).values({ key: "fernanda", value: parsed.data, updatedBy: user.id, updatedAt: new Date() })
    .onConflictDoUpdate({ target: institutionalContent.key, set: { value: parsed.data, updatedBy: user.id, updatedAt: new Date() } });
  if (current.photoUrl !== photoUrl) await deleteImageByUrl(current.photoUrl);
  await audit(user.id, "content.fernanda", "institutional_content", "fernanda", { photoChanged: current.photoUrl !== photoUrl });
  refreshSite();
  return { ok: "Conteúdo publicado no site." };
}

export async function saveContact(_: ContentState, formData: FormData): Promise<ContentState> {
  const user = await requireUser("configuracoes");
  const digits = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");
  const parsed = contactSchema.safeParse({
    whatsapp: digits.startsWith("55") ? digits : `55${digits}`,
    email: String(formData.get("email") ?? "").trim(),
    instagram: String(formData.get("instagram") ?? "").trim(),
    facebook: String(formData.get("facebook") ?? "").trim(),
    linkedin: String(formData.get("linkedin") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Informe o WhatsApp com DDD, somente o número (ex.: 34 99999-9999)." };
  await requireDb().insert(businessSettings).values({ key: "contato", value: parsed.data, updatedBy: user.id, updatedAt: new Date() })
    .onConflictDoUpdate({ target: businessSettings.key, set: { value: parsed.data, updatedBy: user.id, updatedAt: new Date() } });
  await audit(user.id, "settings.contact", "business_settings", "contato", parsed.data);
  refreshSite();
  return { ok: "Configurações salvas. O site já usa o novo número." };
}
