"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb } from "@/db";
import { events } from "@/db/schema";
import { audit } from "@/lib/admin/audit";
import { fromLocalInput } from "@/lib/admin/labels";
import { deleteImageByUrl, fileFrom, MediaError, saveImage } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth";

export type EventFormState = { error?: string; ok?: string } | undefined;

const schema = z.object({
  name: z.string().trim().min(3, "Informe o nome do evento.").max(140),
  description: z.string().trim().max(1200).optional(),
  startsAt: z.string().min(1, "Informe data e horário de início."),
  endsAt: z.string().optional(),
  locationName: z.string().trim().max(140).optional(),
  address: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "Informe a cidade.").max(80),
  status: z.enum(["agendado", "vagas_limitadas", "encerrado", "cancelado"]),
  imageAlt: z.string().trim().max(200).optional(),
});

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function revalidateEvents(id?: string) {
  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/eventos/${id}`);
}

export async function saveEvent(_: EventFormState, formData: FormData): Promise<EventFormState> {
  const user = await requireUser("eventos");
  const id = String(formData.get("id") ?? "") || null;
  if (id && !/^[0-9a-f-]{36}$/.test(id)) return { error: "Evento inválido." };
  const parsed = schema.safeParse(Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const startsAt = fromLocalInput(d.startsAt);
  const endsAt = fromLocalInput(d.endsAt);
  if (!startsAt) return { error: "Data de início inválida." };
  if (endsAt && endsAt <= startsAt) return { error: "O término precisa ser depois do início." };

  const db = requireDb();
  const [current] = id ? await db.select().from(events).where(eq(events.id, id)).limit(1) : [undefined];
  if (id && !current) return { error: "Evento não encontrado." };

  let imageUrl = current?.imageUrl ?? null;
  const file = fileFrom(formData, "image");
  try {
    if (file) imageUrl = await saveImage(file, "evento", user.id);
  } catch (e) {
    return { error: e instanceof MediaError ? e.message : "Falha ao salvar a imagem." };
  }
  if (formData.get("removeImage") === "on" && !file) imageUrl = null;

  const base = slugify(`${d.name}-${startsAt.toISOString().slice(0, 10)}`) || "evento";
  let slug = current?.slug ?? base;
  if (!current) {
    for (let i = 2; ; i++) {
      const [clash] = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1);
      if (!clash) break;
      slug = `${base}-${i}`;
    }
  }

  const values = {
    name: d.name, description: d.description || null, startsAt, endsAt, locationName: d.locationName || null, address: d.address || null,
    city: d.city, status: d.status, imageUrl, imageAlt: d.imageAlt || null, updatedAt: new Date(),
  };

  let eventId = id;
  if (current) {
    await db.update(events).set(values).where(eq(events.id, current.id));
    if (current.imageUrl && current.imageUrl !== imageUrl) await deleteImageByUrl(current.imageUrl);
    await audit(user.id, "event.updated", "events", current.id, { name: d.name, status: d.status });
  } else {
    const [row] = await db.insert(events).values({ ...values, slug, createdBy: user.id }).returning({ id: events.id });
    eventId = row.id;
    await audit(user.id, "event.created", "events", row.id, { name: d.name });
  }
  revalidateEvents(eventId ?? undefined);
  if (!current) redirect(`/admin/eventos/${eventId}?salvo=1`);
  return { ok: "Alterações salvas." };
}

export async function toggleEventPublished(formData: FormData) {
  const user = await requireUser("eventos");
  const id = z.string().uuid().parse(formData.get("id"));
  const publish = formData.get("publish") === "1";
  const db = requireDb();
  await db.update(events).set({ publishedAt: publish ? new Date() : null, updatedAt: new Date() }).where(eq(events.id, id));
  await audit(user.id, publish ? "event.published" : "event.unpublished", "events", id);
  revalidateEvents(id);
}

export async function deleteEvent(formData: FormData) {
  const user = await requireUser("eventos");
  const id = z.string().uuid().parse(formData.get("id"));
  if (formData.get("confirm") !== "on") redirect(`/admin/eventos/${id}?erro=confirmacao`);
  const db = requireDb();
  const [ev] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!ev) redirect("/admin/eventos");
  await db.delete(events).where(eq(events.id, id));
  await deleteImageByUrl(ev.imageUrl);
  await audit(user.id, "event.deleted", "events", id, { name: ev.name, startsAt: ev.startsAt });
  revalidateEvents();
  redirect("/admin/eventos?excluido=1");
}
