import "server-only";
import { eq } from "drizzle-orm";
import sharp, { type OutputInfo } from "sharp";
import { requireDb } from "@/db";
import { mediaAssets } from "@/db/schema";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml", "image/heic", "image/heif"];

export class MediaError extends Error {}

/**
 * Valida, normaliza e grava uma imagem. Toda imagem é decodificada e regravada em WebP:
 * remove metadados (inclusive GPS), corrige a orientação e neutraliza SVG ao rasterizá-lo.
 */
export async function saveImage(file: File, purpose: "evento" | "empresa" | "institucional", userId: string) {
  if (!file || file.size === 0) throw new MediaError("Selecione uma imagem.");
  if (file.size > MAX_BYTES) throw new MediaError("A imagem deve ter no máximo 4 MB.");
  if (file.type && !ACCEPTED.includes(file.type)) throw new MediaError("Formato não suportado. Envie JPG, PNG, WebP ou SVG.");
  const input = Buffer.from(await file.arrayBuffer());
  const maxSide = purpose === "empresa" ? 800 : 1800;
  let out: { data: Buffer; info: OutputInfo };
  try {
    out = await sharp(input, { density: 300, limitInputPixels: 60_000_000 })
      .rotate()
      .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
      .webp({ quality: purpose === "empresa" ? 90 : 82, alphaQuality: 100 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new MediaError("Não foi possível ler essa imagem. Tente outro arquivo.");
  }
  const [row] = await requireDb().insert(mediaAssets).values({
    contentType: "image/webp", bytes: out.data, width: out.info.width, height: out.info.height, size: out.data.length, purpose, createdBy: userId,
  }).returning({ id: mediaAssets.id });
  return `/midia/${row.id}`;
}

/** Remove a imagem anterior quando ela foi enviada por este painel. */
export async function deleteImageByUrl(url: string | null | undefined) {
  const m = url?.match(/^\/midia\/([0-9a-f-]{36})$/);
  if (m) await requireDb().delete(mediaAssets).where(eq(mediaAssets.id, m[1]));
}

export function fileFrom(formData: FormData, key: string) {
  const f = formData.get(key);
  return f instanceof File && f.size > 0 ? f : null;
}
